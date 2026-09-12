from models.qwen import ask_qwen


MODEL_REGISTRY = {
    "text": {
        "name": "qwen3:4b",
        "type": "llm",
        "purpose": "reasoning and text generation",
        "local": True
    },

    "embedding": {
        "name": "qwen3-embedding:0.6b",
        "type": "embedding",
        "purpose": "document and query embeddings for RAG",
        "local": True
    }
}


def get_model(model_type: str) -> dict:

    if model_type not in MODEL_REGISTRY:
        raise ValueError(f"Unsupported model type: {model_type}")

    return MODEL_REGISTRY[model_type]


def route_request(messages: list, request_type: str = "text") -> dict:

    model = get_model(request_type)

    if request_type == "text":

        response = ask_qwen(messages)

        return {
            "response": response,
            "model": model["name"],
            "model_type": model["type"],
            "is_local": model["local"]
        }

    elif request_type == "embedding":

        # RAG module will call the embedding model here
        return {
            "model": model["name"],
            "model_type": model["type"],
            "is_local": model["local"]
        }

    raise ValueError(f"Unsupported request type: {request_type}")