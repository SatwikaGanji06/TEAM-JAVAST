import os
import psycopg
from pgvector.psycopg import register_vector
from psycopg.types.json import Jsonb
from dotenv import load_dotenv
from backend.database.connection import get_connection

# Load environment variables from .env file if it exists
load_dotenv()

class VectorStore:
    """
    Database access layer for RAG vector storage using PostgreSQL and pgvector.
    """

    def __init__(self):
        # Connection parameters are now handled by get_connection()
        pass

    def _get_connection(self):
        """Internal helper to create a database connection."""
        return get_connection()

    def store_chunk(self, chunk_id: int, embedding: list[float], metadata: dict):
        """
        Update a chunk with its embedding and metadata.

        Args:
            chunk_id: The ID of the chunk in document_chunks table.
            embedding: 1024-dimensional vector.
            metadata: Dictionary of metadata to store as JSONB.
        """
        if len(embedding) != 1024:
            raise ValueError(f"Embedding must be 1024-dimensional, got {len(embedding)}")

        with self._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE document_chunks SET embedding = %s, metadata = %s WHERE chunk_id = %s",
                    (embedding, Jsonb(metadata), chunk_id)
                )

    def store_chunks(self, document_id: int, chunks: list[dict]):
        """
        Batch store chunks for a document.

        Args:
            document_id: ID of the document.
            chunks: List of dictionaries containing 'text', 'embedding',
                    'chunk_index', and 'metadata'. Falls back to
                    metadata['chunk_index'] if the top-level field is absent.
        """
        with self._get_connection() as conn:
            with conn.cursor() as cur:
                for chunk in chunks:
                    text = chunk["text"]
                    embedding = chunk["embedding"]
                    metadata = chunk.get("metadata") or {}
                    chunk_index = chunk.get("chunk_index")
                    if chunk_index is None:
                        chunk_index = metadata.get("chunk_index", 0)

                    if len(embedding) != 1024:
                        raise ValueError(f"Embedding must be 1024-dimensional, got {len(embedding)}")

                    cur.execute(
                        """
                        INSERT INTO document_chunks (document_id, chunk_index, chunk_text, embedding, metadata)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (document_id, chunk_index, text, embedding, Jsonb(metadata))
                    )

    def search_similar_chunks(self, query_embedding: list[float], top_k: int = 5):
        """
        Perform a similarity search using cosine distance.

        Args:
            query_embedding: 1024-dimensional vector.
            top_k: Number of top results to return.

        Returns:
            List of tuples (chunk_id, document_id, chunk_index, chunk_text, metadata, similarity).
        """
        if top_k <= 0:
            raise ValueError("top_k must be greater than 0")
        if len(query_embedding) != 1024:
            raise ValueError(f"Query embedding must be 1024-dimensional, got {len(query_embedding)}")

        with self._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        chunk_id,
                        document_id,
                        chunk_index,
                        chunk_text,
                        metadata,
                        1 - (embedding <=> %s::vector) as similarity
                    FROM document_chunks
                    ORDER BY embedding <=> %s::vector
                    LIMIT %s
                    """,
                    (query_embedding, query_embedding, top_k)
                )
                return cur.fetchall()

    def delete_chunks_for_document(self, document_id: int):
        """
        Deletes all chunks associated with a given document.
        Useful for testing.
        """
        with self._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "DELETE FROM document_chunks WHERE document_id = %s",
                    (document_id,)
                )
