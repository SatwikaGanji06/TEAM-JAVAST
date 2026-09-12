import os
from pathlib import Path
from rag.ingestion.pipeline import ingest_document
from rag.database.postgres import VectorStore

# Demo corpus files
DEMO_FILES = [
    "rag/data/raw/demo/refinery_safety.txt",
    "rag/data/raw/demo/equipment_maintenance.txt",
    "rag/data/raw/demo/emergency_operations.txt",
]

def ingest_demo_corpus():
    """
    Ingest the demo corpus into the PostgreSQL database.
    Ensures idempotency by deleting existing demo documents before re-ingesting.
    """
    store = VectorStore()

    print("Starting demo corpus ingestion...")

    for file_path_str in DEMO_FILES:
        file_path = Path(file_path_str)
        if not file_path.exists():
            print(f"Error: File not found: {file_path}")
            continue

        filename = file_path.name
        print(f"\nProcessing {filename}...")

        # 1. Handle Idempotency: Delete existing demo document by filename
        with store._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT document_id FROM documents WHERE file_name = %s",
                    (filename,)
                )
                result = cur.fetchone()
                if result:
                    doc_id = result[0]
                    print(f"Found existing demo document (ID: {doc_id}). Cleaning up...")
                    # delete_chunks_for_document deletes chunks
                    store.delete_chunks_for_document(doc_id)
                    # delete the document record itself
                    cur.execute("DELETE FROM documents WHERE document_id = %s", (doc_id,))

        # 2. Create a new document record to get a fresh document_id
        with store._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO documents (file_name, original_file_name, file_type, file_size, storage_path, uploaded_by)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING document_id
                    """,
                    (
                        filename,
                        filename,
                        "txt",
                        file_path.stat().st_size,
                        str(file_path),
                        1 # Default to admin user
                    )
                )
                new_doc_id = cur.fetchone()[0]

        print(f"Created document record with ID: {new_doc_id}")

        # 3. Use the existing ingestion pipeline (Phase 2 & 3)
        # This handles Loading -> Chunking -> Embedding -> VectorStore
        try:
            chunks = ingest_document(file_path, document_id=new_doc_id, store_in_db=True)
            print(f"Successfully ingested {len(chunks)} chunks for {filename}.")
        except Exception as e:
            print(f"Failed to ingest {filename}: {e}")

    print("\nDemo corpus ingestion complete.")

if __name__ == "__main__":
    ingest_demo_corpus()
