from typing import List, Dict, Any

def format_context(chunks: List[Dict[str, Any]]) -> str:
    """
    Format a list of retrieved chunks into a structured evidence string.

    Args:
        chunks: List of chunk dictionaries from the retrieval layer.
              Expected keys: 'source', 'chunk_text'.

    Returns:
        A formatted string containing the retrieved evidence.
    """
    if not chunks:
        return "No relevant internal documents were found to answer this query."

    evidence_blocks = []
    for i, chunk in enumerate(chunks, start=1):
        source = chunk.get("source", "Unknown Source")
        text = chunk.get("chunk_text", "")
        evidence_blocks.append(f"Document {i} [{source}]: {text}")

    return "\n\n".join(evidence_blocks)


def build_prompt(query: str, context: str) -> str:
    """
    Construct a grounded prompt combining system instructions, context, and the user query.

    Args:
        query: The original user query string.
        context: The formatted context string from format_context().

    Returns:
        A complete prompt string ready for the generation model.

    Raises:
        ValueError: If query or context is None or empty.
    """
    if query is None or not query.strip():
        raise ValueError("Query cannot be None or empty.")

    if context is None or not context.strip():
        raise ValueError("Context cannot be None or empty.")

    system_instructions = (
        "You are a professional industrial assistant. Your goal is to answer the user's "
        "question using ONLY the provided context. \n"
        "Rules:\n"
        "1. Use only the provided context to answer the question.\n"
        "2. Do not invent information or use external knowledge.\n"
        "3. If the answer is not supported by the provided context, clearly state that "
        "the information is not available in the provided documents.\n"
        "4. Be concise and accurate."
    )

    prompt = (
        f"{system_instructions}\n\n"
        f"### RETRIEVED CONTEXT:\n{context}\n\n"
        f"### USER QUESTION:\n{query}\n\n"
        f"### ANSWER:"
    )

    return prompt
