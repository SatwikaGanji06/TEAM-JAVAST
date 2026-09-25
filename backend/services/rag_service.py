from backend.models.qwen import ask_qwen
from rag.database.postgres import VectorStore
from rag.embeddings.ollama_embeddings import embed_text

DEFAULT_TOP_K = 5
SIMILARITY_THRESHOLD = 0.45

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


def query_rag(query: str, top_k: int = DEFAULT_TOP_K, document_ids: list[int] | None = None) -> dict:
    """
    Retrieve relevant document chunks and answer with the local Qwen model.

    When document_ids are explicitly supplied, they define the retrieval
    scope. For generic analysis requests, the best chunks within that
    selected scope are used even when their semantic similarity is below
    the normal relevance threshold.
    """
    question = (query or "").strip()

    if not question:
        return {
            "answer": NO_INDEXED_INFORMATION_ANSWER,
            "sources": [],
        }

    query_embedding = embed_text(question)

    store = VectorStore()

    rows = store.search_similar_chunks(
        query_embedding,
        top_k=top_k,
        document_ids=document_ids,
    )

    sources = []

    for row in rows:
        source = _source_from_row(row)

        if (
            source is not None
            and source["similarity"] >= SIMILARITY_THRESHOLD
        ):
            sources.append(source)

    # Explicit document scope fallback.
    #
    # If the user selected documents, those documents are the
    # retrieval boundary. A generic request such as
    # "analyse the documents" may have low semantic similarity
    # even though the selected documents are exactly what the
    # user wants analyzed.
    if not sources and document_ids:
        scoped_sources = []

        for row in rows:
            source = _source_from_row(row)

            if source is not None:
                scoped_sources.append(source)

        sources = scoped_sources[:top_k]

    if not sources:
        return {
            "answer": NO_INDEXED_INFORMATION_ANSWER,
            "sources": [],
        }

    scope_instruction = ""

    if document_ids:
        scope_instruction = (
            "The user explicitly selected these documents. "
            "Treat them as the complete analysis scope. "
            "Do not introduce information from documents outside "
            "this selected scope.\n\n"
        )

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": (
                scope_instruction
                + "Document context:\n"
                + _build_context(sources)
                + "\n\nQuestion:\n"
                + question
            ),
        },
    ]

    answer = ask_qwen(
        messages,
        think=False,
        num_predict=768,
    )

    return {
        "answer": answer,
        "sources": sources,
    }

def get_document_catalog() -> list[dict]:
    """
    Fetch the list of all indexed documents from the database,
    including the number of indexed chunks for each document.
    """
    from backend.database.connection import get_connection

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    d.document_id,
                    d.file_name,
                    d.uploaded_at,
                    COUNT(dc.chunk_id) AS chunks_created
                FROM documents d
                LEFT JOIN document_chunks dc
                    ON dc.document_id = d.document_id
                GROUP BY
                    d.document_id,
                    d.file_name,
                    d.uploaded_at
                ORDER BY d.uploaded_at DESC
                """
            )

            rows = cur.fetchall()

    return [
        {
            "document_id": row[0],
            "file_name": row[1],
            "uploaded_at": row[2].isoformat() if row[2] else None,
            "chunks_created": int(row[3] or 0),
        }
        for row in rows
    ]

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


