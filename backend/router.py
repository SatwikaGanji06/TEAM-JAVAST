from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import requests
from datetime import datetime

from backend.models.qwen import ask_qwen
from backend.security.audit import log_event
from backend.database.repository import DatabaseRepository
from backend.agent.agent import run_agent

api_router = APIRouter()
db_repo = DatabaseRepository()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    conversation_id: Optional[int] = None
    user_id: Optional[int] = 1  # Default to admin for prototype


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

def _build_agent_response(agent_result: dict) -> str:
    """
    Convert the agent execution result into the final response text.
    """

    results = agent_result.get("results", [])

    if not results:
        return "The agent could not produce a result."

    # For the current Phase-1 agent, there is one execution result.
    first_result = results[0]

    result = first_result.get("result", {})

    if isinstance(result, dict):
        answer = result.get("answer")

        if answer:
            return answer

    if isinstance(result, str):
        return result

    return "The agent completed the requested operation but produced no response."

@api_router.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    message_text = payload.message.strip()

    if not message_text:
        raise HTTPException(status_code=400, detail="Message is required.")

    user_id = payload.user_id or 1
    conv_id = payload.conversation_id

    try:
        # 1. Ensure conversation exists
        if conv_id is None:
            conv_id = db_repo.create_conversation(
                user_id=user_id,
                title=f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            )

        # 2. Store user message
        db_repo.add_message(
            conversation_id=conv_id,
            sender="user",
            text=message_text
        )

        # 3. Run the agent
        agent_result = run_agent(message_text)

        # 4. Extract final response
        response_text = _build_agent_response(agent_result)

        # 5. Store assistant message
        db_repo.add_message(
            conversation_id=conv_id,
            sender="assistant",
            text=response_text
        )

        return ChatResponse(response=response_text)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to complete the local AI request: {str(e)}",
        )
