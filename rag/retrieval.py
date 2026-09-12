from typing import List, Dict, Any, Optional
from rag.embeddings.ollama_embeddings import embed_text
from rag.database.postgres import VectorStore

def retrieve(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Perform semantic retrieval of document chunks based on a natural language query.

    Flow:
    Query String -> Qwen3 Embedding 0.6B -> 1024-D Vector -> VectorStore -> PostgreSQL + pgvector -> Top-K Chunks

    Args:
        query: The natural language query string.
        top_k: Number of most similar chunks to return. Defaults to 5.

    Returns:
        A list of dictionaries containing retrieved chunk information,
        ranked from most similar to least similar.

    Raises:
        ValueError: If the query is empty or top_k is invalid.
    """
    # 1. Query Validation
    if query is None or not query.strip():
        raise ValueError("Query cannot be None or empty.")

    if top_k <= 0:
        raise ValueError("top_k must be a positive integer greater than 0.")

    # 2. Generate Query Embedding
    # Uses the existing qwen3-embedding:0.6b implementation
    query_embedding = embed_text(query)

    # 3. Vector Similarity Search
    # Uses the existing VectorStore which performs cosine similarity (1 - distance)
    store = VectorStore()
    results = store.search_similar_chunks(query_embedding, top_k=top_k)

    # 4. Result Formatting & Source Enrichment
    # VectorStore.search_similar_chunks returns:
    # (chunk_id, document_id, chunk_index, chunk_text, metadata, similarity)

    # To get the filename (source), we need to join with the documents table.
    # Since VectorStore doesn't currently join with documents, we'll fetch
    # the source filename for each retrieved document_id.

    formatted_results = []

    # Optimize by fetching all unique document_ids in the result set
    unique_doc_ids = list(set(res[1] for res in results))
    doc_map = {}

    with store._get_connection() as conn:
        with conn.cursor() as cur:
            # Fetch filenames for all unique documents in the result set
            cur.execute(
                "SELECT document_id, file_name FROM documents WHERE document_id = ANY(%s)",
                (unique_doc_ids,)
            )
            for doc_id, filename in cur.fetchall():
                doc_map[doc_id] = filename

    for res in results:
        chunk_id, doc_id, chunk_index, text, metadata, similarity = res

        formatted_results.append({
            "chunk_id": chunk_id,
            "document_id": doc_id,
            "chunk_index": chunk_index,
            "chunk_text": text,
            "similarity": similarity,
            "metadata": metadata,
            "source": doc_map.get(doc_id, "Unknown")
        })

    return formatted_results
