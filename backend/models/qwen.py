import json
import requests

from backend.security.network import check_network_request

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "qwen3:4b"


def ask_qwen(messages: list) -> str:
    """
    Send a chat request to the local Ollama model and consume the
    response as a stream.

    Streaming is important because Qwen may take several seconds
    before producing its first token on CPU-only hardware.
    """

    if not check_network_request(OLLAMA_URL):
        raise PermissionError(
            f"Network request blocked: {OLLAMA_URL}"
        )

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "messages": messages,
            "stream": True,
        },
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