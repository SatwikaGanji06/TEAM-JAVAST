from pathlib import Path
from rag.ingestion.loaders import load_text_file, load_pdf
from rag.ingestion.chunker import chunk_text

def ingest_document(file_path: str | Path) -> list[dict]:
    """
    Full ingestion pipeline: Load -> Chunk -> Metadata enhancement.

    Supports:
    - .txt files
    - .pdf files

    Returns a list of structured chunks.
    """
    path = Path(file_path)
    filename = path.name
    extension = path.suffix.lower()

    if extension == ".txt":
        # Load text
        text = load_text_file(path)
        # Chunk text
        chunks = chunk_text(text)
        # Add source metadata
        for chunk in chunks:
            chunk["metadata"]["source"] = filename
        return chunks

    elif extension == ".pdf":
        # Load PDF (returns list of pages)
        pages = load_pdf(path)
        all_chunks = []

        for page in pages:
            text = page["text"]
            page_num = page["metadata"]["page"]

            # Chunk text for this page
            page_chunks = chunk_text(text)

            # Add source and page metadata
            for chunk in page_chunks:
                chunk["metadata"]["source"] = filename
                chunk["metadata"]["page"] = page_num

            all_chunks.extend(page_chunks)

        return all_chunks

    else:
        raise ValueError(f"Unsupported file extension: {extension}")
