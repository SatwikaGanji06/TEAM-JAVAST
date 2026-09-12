import os

import psycopg
from dotenv import load_dotenv

load_dotenv()

DEFAULT_UPLOADER_USER_ID = int(os.getenv("DOCUMENT_UPLOADER_USER_ID", "1"))


def _connect():
    return psycopg.connect(
        dbname=os.getenv("DATABASE_NAME", "ai_workbench"),
        user=os.getenv("DATABASE_USER", "postgres"),
        password=os.getenv("DATABASE_PASSWORD", ""),
        host=os.getenv("DATABASE_HOST", "localhost"),
        port=os.getenv("DATABASE_PORT", "5432"),
        autocommit=True,
    )


def find_document_id_by_original_name(original_file_name: str) -> int | None:
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT document_id
                FROM documents
                WHERE original_file_name = %s
                ORDER BY document_id
                LIMIT 1
                """,
                (original_file_name,),
            )
            row = cur.fetchone()
            return row[0] if row else None


def create_or_reuse_document(
    *,
    file_name: str,
    original_file_name: str,
    file_type: str,
    file_size: int,
    storage_path: str,
    uploaded_by: int | None = None,
) -> int:
    """
    Insert a documents row, or reuse one with the same original_file_name.
    """
    uploader = uploaded_by if uploaded_by is not None else DEFAULT_UPLOADER_USER_ID
    existing_id = find_document_id_by_original_name(original_file_name)

    with _connect() as conn:
        with conn.cursor() as cur:
            if existing_id is not None:
                cur.execute(
                    """
                    UPDATE documents
                    SET file_name = %s,
                        file_type = %s,
                        file_size = %s,
                        storage_path = %s,
                        document_status = 'ACTIVE'
                    WHERE document_id = %s
                    """,
                    (file_name, file_type, file_size, storage_path, existing_id),
                )
                return existing_id

            cur.execute(
                """
                INSERT INTO documents (
                    file_name,
                    original_file_name,
                    file_type,
                    file_size,
                    storage_path,
                    uploaded_by
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING document_id
                """,
                (
                    file_name,
                    original_file_name,
                    file_type,
                    file_size,
                    storage_path,
                    uploader,
                ),
            )
            return cur.fetchone()[0]
