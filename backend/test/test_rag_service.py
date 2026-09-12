from unittest.mock import MagicMock, patch

from backend.services.rag_service import (
    NO_INDEXED_INFORMATION_ANSWER,
    query_rag,
)


EMBEDDING = [0.1] * 1024

RETRIEVED_ROW = (
    11,
    42,
    3,
    "Refinery personnel must wear helmets, gloves and safety shoes.",
    {"source": "process_manual_001.pdf", "page": 2},
    0.87,
)


@patch("backend.services.rag_service.ask_qwen")
@patch("backend.services.rag_service.VectorStore")
@patch("backend.services.rag_service.embed_text")
def test_query_rag_embeds_retrieves_and_calls_qwen(
    mock_embed,
    mock_store_cls,
    mock_ask_qwen,
):
    mock_embed.return_value = EMBEDDING
    mock_store = MagicMock()
    mock_store.search_similar_chunks.return_value = [RETRIEVED_ROW]
    mock_store_cls.return_value = mock_store
    mock_ask_qwen.return_value = "Personnel must wear helmets, gloves and safety shoes."

    question = "What PPE is required in restricted areas?"
    result = query_rag(question)

    mock_embed.assert_called_once_with(question)
    mock_store.search_similar_chunks.assert_called_once_with(EMBEDDING, top_k=5)
    mock_ask_qwen.assert_called_once()

    messages = mock_ask_qwen.call_args[0][0]
    user_content = messages[1]["content"]
    assert "process_manual_001.pdf" in user_content
    assert "document_id=42" in user_content
    assert "chunk_index=3" in user_content
    assert RETRIEVED_ROW[3] in user_content
    assert question in user_content

    assert result["answer"] == mock_ask_qwen.return_value
    assert len(result["sources"]) == 1
    source = result["sources"][0]
    assert source["document"] == "process_manual_001.pdf"
    assert source["document_id"] == 42
    assert source["chunk_index"] == 3
    assert source["content"] == RETRIEVED_ROW[3]
    assert source["similarity"] == 0.87
    assert source["metadata"]["page"] == 2


@patch("backend.services.rag_service.ask_qwen")
@patch("backend.services.rag_service.VectorStore")
@patch("backend.services.rag_service.embed_text")
def test_query_rag_without_retrieved_chunks(
    mock_embed,
    mock_store_cls,
    mock_ask_qwen,
):
    mock_embed.return_value = EMBEDDING
    mock_store = MagicMock()
    mock_store.search_similar_chunks.return_value = []
    mock_store_cls.return_value = mock_store

    result = query_rag("What is the shutdown procedure?")

    mock_embed.assert_called_once()
    mock_store.search_similar_chunks.assert_called_once()
    mock_ask_qwen.assert_not_called()

    assert result["answer"] == NO_INDEXED_INFORMATION_ANSWER
    assert result["sources"] == []
