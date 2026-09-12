from backend.models.qwen import ask_qwen
from rag.database.postgres import VectorStore
from rag.embeddings.ollama_embeddings import embed_text

DEFAULT_TOP_K = 5

NO_INDEXED_INFORMATION_ANSWER = (
    "The information was not found in the indexed documents."
)

SYSTEM_PROMPT = (
    "Answer using the retrieved document context. "
    "Do not invent facts that are not supported by the retrieved context. "
    "If the retrieved context does not contain enough information, clearly say "
    "that the information was not found in the indexed documents. "
    "Answer naturally and concisely."
)


def query_rag(query: str, top_k: int = DEFAULT_TOP_K) -> dict:
    """
    Retrieve relevant document chunks and answer with the local Qwen model.

    Returns:
        {
            "answer": str,
            "sources": [
                {
                    "document": str | None,
                    "document_id": int,
                    "chunk_index": int,
                    "content": str,
                    "similarity": float,
                    "metadata": dict,
                },
                ...
            ],
        }
    """
    question = (query or "").strip()
    if not question:
        return {
            "answer": NO_INDEXED_INFORMATION_ANSWER,
            "sources": [],
        }

    query_embedding = embed_text(question)
    store = VectorStore()
    rows = store.search_similar_chunks(query_embedding, top_k=top_k)

    sources = []
    for row in rows:
        source = _source_from_row(row)
        if source is not None:
            sources.append(source)

    if not sources:
        return {
            "answer": NO_INDEXED_INFORMATION_ANSWER,
            "sources": [],
        }

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                "Document context:\n"
                f"{_build_context(sources)}\n\n"
                f"Question:\n{question}"
            ),
        },
    ]

    answer = ask_qwen(messages)

    return {
        "answer": answer,
        "sources": sources,
    }


def _source_from_row(row) -> dict | None:
    """
    Map a VectorStore.search_similar_chunks row to an API-ready source.

    Row: (chunk_id, document_id, chunk_index, chunk_text, metadata, similarity)
    """
    if not row or len(row) < 6:
        return None

    _chunk_id, document_id, chunk_index, chunk_text, metadata, similarity = row[:6]

    if similarity is None or not chunk_text:
        return None

    metadata = dict(metadata) if metadata else {}
    document_name = metadata.get("source")

    return {
        "document": document_name,
        "document_id": document_id,
        "chunk_index": chunk_index,
        "content": chunk_text,
        "similarity": float(similarity),
        "metadata": metadata,
    }


def _build_context(sources: list[dict]) -> str:
    sections = []

    for source in sources:
        document = source.get("document") or f"document_id={source['document_id']}"
        header = (
            f"[Source: {document} | "
            f"document_id={source['document_id']} | "
            f"chunk_index={source['chunk_index']}]"
        )
        sections.append(f"{header}\n{source['content']}")

    return "\n\n".join(sections)
