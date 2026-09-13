import logging

import psycopg
import requests
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from backend.services.ingestion_service import ingest_raw_documents, upload_document
from backend.services.rag_service import query_rag

logger = logging.getLogger(__name__)

rag_router = APIRouter()

OLLAMA_INDEXING_UNAVAILABLE = (
    "Document indexing requires the local Ollama embedding service."
)
DOCUMENT_INDEX_UNAVAILABLE = "Unable to reach the document index."
INGESTION_FAILED = "Unable to index the document."


class RagQueryRequest(BaseModel):
    query: str = Field(min_length=1)


class RagSource(BaseModel):
    document: str | None = None
    document_id: int
    chunk_index: int
    content: str
    similarity: float
    metadata: dict = Field(default_factory=dict)


class RagQueryResponse(BaseModel):
    answer: str
    sources: list[RagSource]


class RagUploadResponse(BaseModel):
    status: str
    document_id: int
    file_name: str
    chunks_created: int


class RagIngestResponse(BaseModel):
    status: str
    documents_processed: int
    chunks_created: int


def _http_error_for_ingestion(exc: Exception) -> HTTPException:
    if isinstance(exc, HTTPException):
        return exc

    if isinstance(exc, FileNotFoundError):
        return HTTPException(status_code=404, detail="File not found.")

    if isinstance(exc, PermissionError):
        logger.exception("Document indexing blocked by network policy")
        return HTTPException(status_code=503, detail=OLLAMA_INDEXING_UNAVAILABLE)

    if isinstance(exc, requests.RequestException):
        logger.exception("Document indexing failed to reach Ollama")
        return HTTPException(status_code=503, detail=OLLAMA_INDEXING_UNAVAILABLE)

    if isinstance(exc, psycopg.Error):
        logger.exception("Document indexing failed to reach the document index")
        return HTTPException(status_code=503, detail=DOCUMENT_INDEX_UNAVAILABLE)

    if isinstance(exc, ValueError):
        message = str(exc)
        if "Unsupported file" in message:
            return HTTPException(
                status_code=400,
                detail="Unsupported file type. Use a PDF or TXT file.",
            )
        if "Unable to read PDF" in message:
            return HTTPException(status_code=400, detail="Unable to read the PDF file.")
        if "A file is required" in message:
            return HTTPException(status_code=400, detail="A file is required.")
        logger.exception("Invalid document indexing request")
        return HTTPException(status_code=400, detail="Unable to index the document.")

    logger.exception("Document indexing failed")
    return HTTPException(status_code=503, detail=INGESTION_FAILED)



@rag_router.post("/api/rag/query", response_model=RagQueryResponse)
def rag_query(payload: RagQueryRequest) -> RagQueryResponse:
    query = payload.query.strip()

    if not query:
        raise HTTPException(status_code=400, detail="Query is required.")

    try:
        result = query_rag(query)
        return RagQueryResponse(
            answer=result["answer"],
            sources=result["sources"],
        )

    except HTTPException:
        raise

    except PermissionError:
        logger.exception("RAG query blocked by network policy")
        raise HTTPException(
            status_code=503,
            detail="Unable to reach the local AI backend.",
        )

    except requests.RequestException:
        logger.exception("RAG query failed to reach the local model")
        raise HTTPException(
            status_code=503,
            detail="Unable to reach the local AI backend.",
        )

    except psycopg.Error:
        logger.exception("RAG query failed to reach the document index")
        raise HTTPException(
            status_code=503,
            detail="Unable to reach the document index.",
        )

    except ValueError:
        logger.exception("Invalid RAG query")
        raise HTTPException(
            status_code=400,
            detail="Invalid query.",
        )

    except Exception:
        logger.exception("RAG query failed")
        raise HTTPException(
            status_code=503,
            detail="Unable to complete the document search.",
        )


@rag_router.post("/api/rag/upload", response_model=RagUploadResponse)
def rag_upload(file: UploadFile | None = File(default=None)) -> RagUploadResponse:
    if file is None or not file.filename:
        raise HTTPException(status_code=400, detail="A file is required.")

    try:
        content = file.file.read()
        result = upload_document(file.filename, content)
        return RagUploadResponse(
            status=result["status"],
            document_id=result["document_id"],
            file_name=result["file_name"],
            chunks_created=result["chunks_created"],
        )
    except Exception as exc:
        raise _http_error_for_ingestion(exc) from exc


@rag_router.post("/api/rag/ingest", response_model=RagIngestResponse)
def rag_ingest() -> RagIngestResponse:
    try:
        result = ingest_raw_documents()
        return RagIngestResponse(
            status=result["status"],
            documents_processed=result["documents_processed"],
            chunks_created=result["chunks_created"],
        )
    except Exception as exc:
        raise _http_error_for_ingestion(exc) from exc
