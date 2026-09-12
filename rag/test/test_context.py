import pytest
from rag.context import format_context, build_prompt

def test_format_context_single_chunk():
    """Verify formatting for a single retrieved chunk."""
    chunks = [{"source": "doc1.txt", "chunk_text": "Hello world"}]
    result = format_context(chunks)
    assert "Document 1 [doc1.txt]: Hello world" in result

def test_format_context_multiple_chunks():
    """Verify formatting for multiple retrieved chunks and order preservation."""
    chunks = [
        {"source": "doc1.txt", "chunk_text": "First chunk"},
        {"source": "doc2.txt", "chunk_text": "Second chunk"},
    ]
    result = format_context(chunks)
    assert "Document 1 [doc1.txt]: First chunk" in result
    assert "Document 2 [doc2.txt]: Second chunk" in result
    # Verify order
    assert result.index("Document 1") < result.index("Document 2")

def test_format_context_empty_list():
    """Verify safe handling of an empty chunk list."""
    result = format_context([])
    assert result == "No relevant internal documents were found to answer this query."

def test_format_context_missing_keys():
    """Verify handling of chunks with missing source or text."""
    chunks = [{"something": "else"}]
    result = format_context(chunks)
    assert "Document 1 [Unknown Source]: " in result

def test_build_prompt_structure():
    """Verify that the prompt contains all required components."""
    query = "What is PPE?"
    context = "PPE is Personal Protective Equipment."
    prompt = build_prompt(query, context)

    # Check for system instructions
    prompt_lower = prompt.lower()
    assert "answer the user's question using only the provided context" in prompt_lower
    assert "do not invent information" in prompt_lower
    assert "not available in the provided documents" in prompt_lower

    # Check for context and query
    assert "### RETRIEVED CONTEXT:" in prompt
    assert context in prompt
    assert "### USER QUESTION:" in prompt
    assert query in prompt
    assert "### ANSWER:" in prompt

def test_build_prompt_invalid_inputs():
    """Verify that build_prompt rejects None or empty inputs."""
    # Empty query
    with pytest.raises(ValueError):
        build_prompt("", "Some context")

    # None query
    with pytest.raises(ValueError):
        build_prompt(None, "Some context")

    # Empty context
    with pytest.raises(ValueError):
        build_prompt("Some query", "")

    # None context
    with pytest.raises(ValueError):
        build_prompt("Some query", None)

def test_integration_flow():
    """Verify the flow from raw chunks to final prompt."""
    chunks = [
        {"source": "safety.txt", "chunk_text": "Wear a helmet."},
        {"source": "ops.txt", "chunk_text": "Notify control room."}
    ]
    query = "What should I do?"

    context = format_context(chunks)
    prompt = build_prompt(query, context)

    assert "safety.txt" in prompt
    assert "ops.txt" in prompt
    assert "Wear a helmet" in prompt
    assert "Notify control room" in prompt
    assert query in prompt
