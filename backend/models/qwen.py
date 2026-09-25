from typing import Any
import json
import requests

from backend.security.network import check_network_request

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "qwen3:4b"


def ask_qwen(
    messages: list,
    think: bool | None = None,
    num_predict: int | None = None,
) -> str:
    """
    Send a chat request to the local Ollama model.

    Optional generation controls allow callers such as RAG to use
    bounded, non-thinking generation without changing the default
    behavior of the normal agent response path.
    """

    if not check_network_request(OLLAMA_URL):
        raise PermissionError(
            f"Network request blocked: {OLLAMA_URL}"
        )

    payload: dict[str, Any] = {
        "model": MODEL,
        "messages": messages,
        "stream": True,
    }

    if think is not None:
        payload["think"] = think

    if num_predict is not None:
        payload["options"] = {
            "num_predict": num_predict,
        }

    response = requests.post(
        OLLAMA_URL,
        json=payload,
        stream=True,
        timeout=(10, 180),
    )

    response.raise_for_status()

    pieces = []

    for line in response.iter_lines(decode_unicode=True):
        if not line:
            continue

        data = json.loads(line)

        message = data.get("message", {})
        content = message.get("content", "")

        if content:
            pieces.append(content)

        if data.get("done"):
            break

    return "".join(pieces).strip()
