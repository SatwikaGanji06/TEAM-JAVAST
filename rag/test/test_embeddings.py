import pytest
import numpy as np

from rag.embeddings.ollama_embeddings import embed_texts


def cosine_similarity(a: list[float], b: list[float]) -> float:
    a = np.array(a)
    b = np.array(b)

    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def test_semantic_similarity():
    texts = [
        "The reactor temperature exceeded the safety limit.",
        "The reactor temperature went above the permitted threshold.",
        "The employee submitted a leave application.",
    ]

    embeddings = embed_texts(texts)

    similarity_related = cosine_similarity(
        embeddings[0],
        embeddings[1],
    )

    similarity_unrelated = cosine_similarity(
        embeddings[0],
        embeddings[2],
    )

    print("\nRelated similarity:", similarity_related)
    print("Unrelated similarity:", similarity_unrelated)

    assert similarity_related > similarity_unrelated


def test_same_text_similarity():
    texts = [
        "The reactor temperature exceeded the safety limit.",
        "The reactor temperature exceeded the safety limit.",
    ]

    embeddings = embed_texts(texts)

    similarity = cosine_similarity(
        embeddings[0],
        embeddings[1],
    )

    print("\nSame-text similarity:", similarity)

    assert similarity > 0.99


def test_batch_embeddings():
    texts = [
        "The reactor temperature exceeded the safety limit.",
        "The pump pressure is above the recommended level.",
        "The employee submitted a leave application.",
    ]

    embeddings = embed_texts(texts)

    print("\nNumber of texts:", len(texts))
    print("Number of embeddings:", len(embeddings))
    print("Embedding dimensions:", len(embeddings[0]))

    assert len(embeddings) == len(texts)

    for embedding in embeddings:
        assert len(embedding) == 1024


def test_ollama_connection_failure():
    import requests

    invalid_url = "http://localhost:99999/api/embed"

    with pytest.raises(requests.exceptions.RequestException):
        requests.post(
            invalid_url,
            json={
                "model": "qwen3-embedding:0.6b",
                "input": "test",
            },
            timeout=2,
        )
