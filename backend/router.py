from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import requests

from models.qwen import ask_qwen
from security.audit import log_event

api_router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


class ChatResponse(BaseModel):
    response: str


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
        raise ValueError(f"Unsupported request type: {model_type}")

    return MODEL_REGISTRY[model_type]


def route_request(
    messages: list,
    request_type: str = "text",
    user_id: int | None = None
) -> dict:

    try:
        model = get_model(request_type)

        # Audit model selection
        log_event(
            user_id=user_id,
            action="MODEL_SELECTED",
            model=model["name"],
            resource=request_type,
            success=True,
            external_call=False,
            details="Local model selected by router"
        )

        if request_type == "text":

            # Run local Qwen model
            response = ask_qwen(messages)

            # Audit successful inference
            log_event(
                user_id=user_id,
                action="MODEL_INFERENCE",
                model=model["name"],
                resource="chat",
                success=True,
                external_call=False,
                details="Local model inference completed"
            )

            return {
                "response": response,
                "model": model["name"],
                "model_type": model["type"],
                "is_local": model["local"]
            }

        elif request_type == "embedding":

            # RAG module will call the embedding model
            return {
                "model": model["name"],
                "model_type": model["type"],
                "is_local": model["local"]
            }

    except Exception as e:

        # Audit failed request
        log_event(
            user_id=user_id,
            action="REQUEST_FAILED",
            model=MODEL_REGISTRY.get(request_type, {}).get("name"),
            resource=request_type,
            success=False,
            external_call=False,
            details=str(e)
        )

        raise


@api_router.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    message = payload.message.strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message is required.")

    try:
        result = route_request(
            messages=[{"role": "user", "content": message}],
            request_type="text",
        )
        return ChatResponse(response=result["response"])

    except HTTPException:
        raise

    except PermissionError:
        raise HTTPException(
            status_code=503,
            detail="Unable to reach the local AI backend.",
        )

    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="Unable to reach the local AI backend.",
        )

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to reach the local AI backend.",
        )