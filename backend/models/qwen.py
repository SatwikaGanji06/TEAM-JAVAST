import requests


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "qwen3:4b"


def ask_qwen(messages: list) -> str:

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "messages": messages,
            "stream": False
        },
        timeout=600
    )

    response.raise_for_status()

    data = response.json()

    return data["message"]["content"]