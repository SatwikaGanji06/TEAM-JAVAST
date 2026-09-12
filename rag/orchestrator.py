from typing import Dict, Any
from rag.retrieval import retrieve
from rag.context import format_context, build_prompt
from rag.generation import generate

def ask(query: str, top_k: int = 5) -> Dict[str, Any]:
    """
    The primary entry point for the RAG system.
    Coordinates retrieval, context construction, and generation.

    Args:
        query: The user's natural language question.
        top_k: Number of most similar chunks to retrieve. Defaults to 5.

    Returns:
        A dictionary containing the generated answer and the original retrieved sources.

    Raises:
        ValueError: If query or top_k are invalid (propagated from retrieve).
        GenerationError: If Ollama generation fails (propagated from generate).
    """
    # 1. Retrieval
    # retrieve() already handles validation for query and top_k
    chunks = retrieve(query, top_k=top_k)

    # 2. Context Construction
    context = format_context(chunks)
    prompt = build_prompt(query, context)

    # 3. Generation
    answer = generate(prompt)

    # 4. Packaging
    return {
        "answer": answer,
        "sources": chunks
    }
