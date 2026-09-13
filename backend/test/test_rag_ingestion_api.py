from unittest.mock import patch

import requests
from fastapi.testclient import TestClient

from backend.main import app
from backend.rag_router import OLLAMA_INDEXING_UNAVAILABLE

client = TestClient(app)


def test_upload_requires_a_file():
    response = client.post("/api/rag/upload")
    assert response.status_code == 400
    assert response.json()["detail"] == "A file is required."


def test_upload_rejects_unsupported_file():
    response = client.post(
        "/api/rag/upload",
        files={"file": ("notes.docx", b"not a pdf", "application/octet-stream")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported file type. Use a PDF or TXT file."


@patch("backend.services.ingestion_service.ingest_document")
@patch("backend.services.ingestion_service.VectorStore")
@patch("backend.services.ingestion_service.create_or_reuse_document")
def test_upload_indexes_with_existing_pipeline(
    mock_create_document,
    mock_store_cls,
    mock_ingest,
    tmp_path,
    monkeypatch,
):
    monkeypatch.setenv("RAG_RAW_DOCUMENTS_DIR", str(tmp_path))
    mock_create_document.return_value = 17
    mock_ingest.return_value = [
        {"text": "chunk one", "chunk_index": 0, "metadata": {}},
        {"text": "chunk two", "chunk_index": 1, "metadata": {}},
    ]

    response = client.post(
        "/api/rag/upload",
        files={"file": ("safety.txt", b"Wear helmets in restricted areas.", "text/plain")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["document_id"] == 17
    assert body["file_name"] == "safety.txt"
    assert body["chunks_created"] == 2
    mock_create_document.assert_called_once()
    mock_store_cls.return_value.delete_chunks_for_document.assert_called_once_with(17)
    mock_ingest.assert_called_once()
    args, kwargs = mock_ingest.call_args
    assert kwargs["document_id"] == 17
    assert kwargs["store_in_db"] is True
    saved = tmp_path / "safety.txt"
    assert saved.exists()
    assert "document_id" in body
    assert "storage_path" not in body


@patch("backend.services.ingestion_service.ingest_document")
@patch("backend.services.ingestion_service.VectorStore")
@patch("backend.services.ingestion_service.create_or_reuse_document")
def test_upload_reports_ollama_unavailable(
    mock_create_document,
    mock_store_cls,
    mock_ingest,
    tmp_path,
    monkeypatch,
):
    monkeypatch.setenv("RAG_RAW_DOCUMENTS_DIR", str(tmp_path))
    mock_create_document.return_value = 4
    mock_ingest.side_effect = requests.ConnectionError("Ollama is not running")

    response = client.post(
        "/api/rag/upload",
        files={"file": ("manual.txt", b"Emergency shutdown procedure.", "text/plain")},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == OLLAMA_INDEXING_UNAVAILABLE
    mock_ingest.assert_called_once()


@patch("backend.rag_router.ingest_raw_documents")
def test_ingest_missing_file_returns_404(mock_ingest_raw):
    mock_ingest_raw.side_effect = FileNotFoundError(
        "C:/secret/internal/path/missing.txt"
    )

    response = client.post("/api/rag/ingest")

    assert response.status_code == 404
    assert response.json()["detail"] == "File not found."
    assert "secret" not in response.json()["detail"]
    assert "missing.txt" not in response.json()["detail"]


@patch("backend.rag_router.ingest_raw_documents")
def test_ingest_endpoint_returns_counts(mock_ingest_raw):
    mock_ingest_raw.return_value = {
        "status": "success",
        "documents_processed": 2,
        "chunks_created": 42,
    }

    response = client.post("/api/rag/ingest")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "documents_processed": 2,
        "chunks_created": 42,
    }
    mock_ingest_raw.assert_called_once()


@patch("backend.rag_router.ingest_raw_documents")
def test_ingest_endpoint_reports_ollama_unavailable(mock_ingest_raw):
    mock_ingest_raw.side_effect = requests.ConnectionError("Ollama is not running")

    response = client.post("/api/rag/ingest")

    assert response.status_code == 503
    assert response.json()["detail"] == OLLAMA_INDEXING_UNAVAILABLE


def test_chat_route_still_registered():
    paths = set(app.openapi()["paths"])
    assert "/api/chat" in paths
    assert "/api/rag/query" in paths
    assert "/api/rag/upload" in paths
    assert "/api/rag/ingest" in paths
