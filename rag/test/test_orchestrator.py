import pytest
from unittest.mock import patch, MagicMock
from rag.orchestrator import ask
from rag.generation import GenerationError

def test_ask_success():
    """Verify the full orchestration flow from retrieval to answer."""
    # Mock data
    mock_chunks = [
        {"chunk_id": 1, "document_id": 10, "chunk_text": "Chunk 1", "source": "doc1.txt", "similarity": 0.9},
        {"chunk_id": 2, "document_id": 10, "chunk_text": "Chunk 2", "source": "doc1.txt", "similarity": 0.8},
    ]
    mock_context = "Formatted context"
    mock_prompt = "Final prompt"
    mock_answer = "The answer is 42."

    with patch("rag.orchestrator.retrieve", return_value=mock_chunks) as mock_retrieve, \
         patch("rag.orchestrator.format_context", return_value=mock_context) as mock_format, \
         patch("rag.orchestrator.build_prompt", return_value=mock_prompt) as mock_build, \
         patch("rag.orchestrator.generate", return_value=mock_answer) as mock_generate:

        query = "What is the answer?"
        top_k = 2
        result = ask(query, top_k=top_k)

        # Verify flow
        mock_retrieve.assert_called_once_with(query, top_k=top_k)
        mock_format.assert_called_once_with(mock_chunks)
        mock_build.assert_called_once_with(query, mock_context)
        mock_generate.assert_called_once_with(mock_prompt)

        # Verify output
        assert result["answer"] == mock_answer
        assert result["sources"] == mock_chunks
        assert len(result["sources"]) == 2

def test_ask_empty_retrieval():
    """Verify flow when retrieval returns no chunks."""
    mock_chunks = []
    mock_context = "No documents found."
    mock_prompt = "Prompt for no context"
    mock_answer = "I don't know the answer."

    with patch("rag.orchestrator.retrieve", return_value=mock_chunks) as mock_retrieve, \
         patch("rag.orchestrator.format_context", return_value=mock_context) as mock_format, \
         patch("rag.orchestrator.build_prompt", return_value=mock_prompt) as mock_build, \
         patch("rag.orchestrator.generate", return_value=mock_answer) as mock_generate:

        result = ask("Unknown query")

        assert result["answer"] == mock_answer
        assert result["sources"] == []
        mock_generate.assert_called_once_with(mock_prompt)

def test_ask_invalid_query():
    """Verify that invalid query propagation from retrieve() works."""
    with patch("rag.orchestrator.retrieve", side_effect=ValueError("Query cannot be None or empty.")):
        with pytest.raises(ValueError, match="Query cannot be None or empty."):
            ask("", top_k=5)

def test_ask_invalid_top_k():
    """Verify that invalid top_k propagation from retrieve() works."""
    with patch("rag.orchestrator.retrieve", side_effect=ValueError("top_k must be a positive integer")):
        with pytest.raises(ValueError, match="top_k must be a positive integer"):
            ask("Valid query", top_k=0)

def test_ask_generation_error_propagation():
    """Verify that GenerationError from generate() propagates correctly."""
    with patch("rag.orchestrator.retrieve", return_value=[{"id": 1}]), \
         patch("rag.orchestrator.format_context", return_value="ctx"), \
         patch("rag.orchestrator.build_prompt", return_value="prompt"), \
         patch("rag.orchestrator.generate", side_effect=GenerationError("Ollama unavailable")):

        with pytest.raises(GenerationError, match="Ollama unavailable"):
            ask("Valid query")
