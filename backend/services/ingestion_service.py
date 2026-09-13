import os
from pathlib import Path

from backend.services.document_service import create_or_reuse_document
from rag.database.postgres import VectorStore
from rag.ingestion.pipeline import ingest_document

ALLOWED_EXTENSIONS = {".pdf", ".txt"}


def get_raw_dir() -> Path:
    override = os.getenv("RAG_RAW_DOCUMENTS_DIR")
    if override:
        return Path(override)
    return Path(__file__).resolve().parents[2] / "rag" / "data" / "raw"


def safe_filename(filename: str | None) -> str:
    if not filename:
        raise ValueError("A file is required.")
    name = Path(filename).name
    if not name or name in {".", ".."}:
        raise ValueError("A file is required.")
    return name


def validate_extension(filename: str) -> str:
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type. Use a PDF or TXT file.")
    return extension


def save_upload(filename: str, content: bytes) -> Path:
    original_name = safe_filename(filename)
    validate_extension(original_name)
    raw_dir = get_raw_dir()
    raw_dir.mkdir(parents=True, exist_ok=True)
    destination = raw_dir / original_name
    destination.write_bytes(content)
    return destination


def index_file(file_path: str | Path, original_file_name: str | None = None) -> dict:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError("File not found.")
    if not path.is_file():
        raise ValueError("A file is required.")

    stored_name = path.name
    original_name = safe_filename(original_file_name or stored_name)
    extension = validate_extension(stored_name)
    file_type = extension.lstrip(".")
    file_size = path.stat().st_size

    document_id = create_or_reuse_document(
        file_name=stored_name,
        original_file_name=original_name,
        file_type=file_type,
        file_size=file_size,
        storage_path=stored_name,
    )

    store = VectorStore()
    store.delete_chunks_for_document(document_id)

    chunks = ingest_document(path, document_id=document_id, store_in_db=True)

    return {
        "status": "success",
        "document_id": document_id,
        "file_name": original_name,
        "chunks_created": len(chunks),
    }


def upload_document(filename: str | None, content: bytes) -> dict:
    destination = save_upload(filename, content)
    return index_file(destination, original_file_name=filename)


def ingest_raw_documents() -> dict:
    raw_dir = get_raw_dir()
    if not raw_dir.exists():
        return {
            "status": "success",
            "documents_processed": 0,
            "chunks_created": 0,
        }

    documents_processed = 0
    chunks_created = 0

    for path in sorted(raw_dir.iterdir()):
        if not path.is_file():
            continue
        if path.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue
        result = index_file(path)
        documents_processed += 1
        chunks_created += result["chunks_created"]

    return {
        "status": "success",
        "documents_processed": documents_processed,
        "chunks_created": chunks_created,
    }
