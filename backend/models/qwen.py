import requests

from backend.security.network import check_network_request


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "qwen3:4b"


def ask_qwen(messages: list) -> str:

    # Security check before making any network request
    if not check_network_request(OLLAMA_URL):
        raise PermissionError(
            f"Network request blocked: {OLLAMA_URL}"
        )

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