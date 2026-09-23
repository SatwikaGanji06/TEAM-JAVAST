import pytest
import os
from pathlib import Path
from rag.database.postgres import VectorStore
from rag.embeddings.ollama_embeddings import embed_text, embed_texts

# Mock environment variables for testing if not set
os.environ.setdefault("DATABASE_NAME", "ai_workbench")
os.environ.setdefault("DATABASE_USER", "postgres")
os.environ.setdefault("DATABASE_PASSWORD", "")
os.environ.setdefault("DATABASE_HOST", "localhost")
os.environ.setdefault("DATABASE_PORT", "5432")

@pytest.fixture
def vector_store():
    store = VectorStore()
    yield store
    # Cleanup test data
    try:
        store.delete_chunks_for_document(999)
        with store._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM documents WHERE document_id = 999")
    except Exception:
        pass

def create_test_doc(vector_store, doc_id=999):
    """Helper to create a document in the DB to satisfy foreign key constraints."""
    with vector_store._get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO documents (document_id, file_name, original_file_name, file_type, file_size, storage_path, uploaded_by) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (document_id) DO NOTHING",
                (doc_id, "test.pdf", "test.pdf", "pdf", 1000, "/tmp/test.pdf", 1)
            )

def test_connection(vector_store):
    """Verify that the VectorStore can connect to the database."""
    try:
        with vector_store._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                assert cur.fetchone()[0] == 1
    except Exception as e:
        pytest.fail(f"Database connection failed: {e}")

def test_store_and_retrieve(vector_store):
    """Verify that a chunk can be stored and then retrieved via similarity search."""
    doc_id = 999
    create_test_doc(vector_store, doc_id)

    text = "This is a test chunk for vector storage."
    embedding = embed_text(text)
    metadata = {"test": "true", "page": 1}

    # 2. Store the chunk
    chunks_to_store = [{
        "text": text,
        "embedding": embedding,
        "metadata": metadata,
        "chunk_index": 999
    }]
    vector_store.store_chunks(doc_id, chunks_to_store)

    # 3. Search for it using the same embedding
    results = vector_store.search_similar_chunks(embedding, top_k=1)

    assert len(results) > 0
    assert text in results[0][3]
    assert results[0][5] > 0.9

def test_similarity_ranking(vector_store):
    """Verify that similarity search returns relevant chunks first."""
    doc_id = 999
    create_test_doc(vector_store, doc_id)
    vector_store.delete_chunks_for_document(doc_id)

    # Three chunks with varying similarity to "Artificial Intelligence"
    texts = [
        "Artificial Intelligence is transforming the world.", # High similarity
        "Machine learning is a subset of AI.",              # Medium similarity
        "The weather is sunny today in London."              # Low similarity
    ]

    embeddings = embed_texts(texts)
    chunks = []
    for i, (t, e) in enumerate(zip(texts, embeddings)):
        chunks.append({
            "text": t,
            "embedding": e,
            "metadata": {"index": i},
            "chunk_index": 100 + i
        })

    vector_store.store_chunks(doc_id, chunks)

    query = "AI and machine learning"
    query_emb = embed_text(query)
    results = vector_store.search_similar_chunks(query_emb, top_k=3, document_ids=[doc_id])

    # Result texts (chunk_text is now index 3)
    result_texts = [r[3] for r in results]

    # The most similar should be the first one (AI transforming) or second one (ML subset)
    assert "Artificial Intelligence" in result_texts[0] or "Machine learning" in result_texts[0]
    # The weather chunk should be last
    assert "weather" in result_texts[-1]

def test_dimension_validation(vector_store):
    """Verify that the system rejects embeddings with incorrect dimensions."""
    invalid_embedding = [0.1] * 512 # Wrong dimension

    with pytest.raises(ValueError, match="Embedding must be 1024-dimensional"):
        vector_store.store_chunk(1, invalid_embedding, {})

    with pytest.raises(ValueError, match="Query embedding must be 1024-dimensional"):
        vector_store.search_similar_chunks(invalid_embedding)

def test_metadata_integrity(vector_store):
    """Verify that JSONB metadata is correctly preserved."""
    doc_id = 999
    create_test_doc(vector_store, doc_id)
    text = "Metadata test chunk"
    embedding = embed_text(text)
    metadata = {
        "source": "test_manual.pdf",
        "page": 42,
        "category": "safety",
        "tags": ["critical", "urgent"]
    }

    chunks = [{
        "text": text,
        "embedding": embedding,
        "metadata": metadata,
        "chunk_index": 888
    }]
    vector_store.store_chunks(doc_id, chunks)

    results = vector_store.search_similar_chunks(embedding, top_k=1)
    retrieved_metadata = results[0][4] # metadata is now index 4

    assert retrieved_metadata["source"] == "test_manual.pdf"
    assert retrieved_metadata["page"] == 42
    assert "critical" in retrieved_metadata["tags"]
