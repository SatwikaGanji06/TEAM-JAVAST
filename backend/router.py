from models.qwen import ask_qwen


def route_request(prompt: str, request_type: str = "text") -> str:

    if request_type == "text":
        return ask_qwen(prompt)

    else:
        raise ValueError(f"Unsupported request type: {request_type}")