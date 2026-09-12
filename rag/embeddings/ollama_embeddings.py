import requests


OLLAMA_URL = "http://localhost:11434/api/embed"
MODEL = "qwen3-embedding:0.6b"


def embed_text(text: str) -> list[float]:
    """
    Generate an embedding for a single piece of text
    using the local Ollama embedding model.
    """

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "input": text,
        },
        timeout=120,
    )

    response.raise_for_status()

    data = response.json()

    return data["embeddings"][0]


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for multiple texts.
    """

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "input": texts,
        },
        timeout=120,
    )

    response.raise_for_status()

    data = response.json()

    return data["embeddings"]
