import pytest
from pathlib import Path
from rag.ingestion.pipeline import ingest_document

TXT_FILE = "rag/data/raw/test_manual.txt"
PDF_FILE = "rag/data/raw/test_manual.pdf"

def test_pipeline_txt():
    chunks = ingest_document(TXT_FILE)

    assert len(chunks) > 0
    for chunk in chunks:
        assert "text" in chunk
        assert "metadata" in chunk
        assert chunk["metadata"]["source"] == Path(TXT_FILE).name
        assert "chunk_index" in chunk["metadata"]

def test_pipeline_pdf():
    chunks = ingest_document(PDF_FILE)

    assert len(chunks) > 0
    for chunk in chunks:
        assert "text" in chunk
        assert "metadata" in chunk
        assert chunk["metadata"]["source"] == Path(PDF_FILE).name
        assert "page" in chunk["metadata"]
        assert "chunk_index" in chunk["metadata"]

def test_pipeline_unsupported_extension(tmp_path):
    bad_file = tmp_path / "test.md"
    bad_file.write_text("some content")

    with pytest.raises(ValueError, match="Unsupported file extension"):
        ingest_document(bad_file)

def test_pipeline_missing_file():
    with pytest.raises(FileNotFoundError):
        ingest_document("rag/data/raw/missing.txt")
