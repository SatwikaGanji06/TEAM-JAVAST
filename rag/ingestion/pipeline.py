from pathlib import Path
from rag.ingestion.loaders import load_text_file, load_pdf
from rag.ingestion.chunker import chunk_text
from rag.embeddings.ollama_embeddings import embed_texts
from rag.database.postgres import VectorStore

def ingest_document(file_path: str | Path, document_id: int | None = None, store_in_db: bool = False) -> list[dict]:
    """
    Full ingestion pipeline: Load -> Chunk -> Embed -> Store.

    Supports:
    - .txt files
    - .pdf files

    Returns a list of structured chunks.
    """
    path = Path(file_path)
    filename = path.name
    extension = path.suffix.lower()

    # 1. Loading & Chunking
    if extension == ".txt":
        text = load_text_file(path)
        chunks = chunk_text(text)
        for chunk in chunks:
            chunk["metadata"]["source"] = filename
    elif extension == ".pdf":
        pages = load_pdf(path)
        all_chunks = []
        for page in pages:
            text = page["text"]
            page_num = page["metadata"]["page"]
            page_chunks = chunk_text(text)
            for chunk in page_chunks:
                chunk["metadata"]["source"] = filename
                chunk["metadata"]["page"] = page_num
            all_chunks.extend(page_chunks)
        chunks = all_chunks
    else:
        raise ValueError(f"Unsupported file extension: {extension}")

    if not chunks:
        return []

    # 2. Embedding & Storage (Phase 3)
    if store_in_db:
        # Generate embeddings for all chunks in one batch
        texts = [chunk["text"] for chunk in chunks]
        embeddings = embed_texts(texts)

        # Add embeddings to chunk objects
        for i, chunk in enumerate(chunks):
            chunk["embedding"] = embeddings[i]

        # Store in PostgreSQL
        if document_id is None:
            raise ValueError("document_id is required when store_in_db is True")

        store = VectorStore()
        store.store_chunks(document_id, chunks)

    return chunks
