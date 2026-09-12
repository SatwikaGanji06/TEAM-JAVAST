from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from backend.approval.generator import (
    build_approval_note_data,
    generate_approval_note,
)
from backend.agent.agent import run_agent
from backend.database.repository import DatabaseRepository
from backend.models.qwen import ask_qwen
from backend.security.audit import log_event


api_router = APIRouter()
db_repo = DatabaseRepository()


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    conversation_id: Optional[int] = None
    user_id: Optional[int] = 1


class ChatResponse(BaseModel):
    response: str


class ApprovalNoteRequest(BaseModel):
    message: str = Field(min_length=1)


# ============================================================
# MODEL REGISTRY
# ============================================================

MODEL_REGISTRY = {
    "text": {
        "name": "qwen3:4b",
        "type": "llm",
        "purpose": "reasoning and text generation",
        "local": True,
    },
    "embedding": {
        "name": "qwen3-embedding:0.6b",
        "type": "embedding",
        "purpose": "document and query embeddings for RAG",
        "local": True,
    },
}


def get_model(model_type: str) -> dict:
    if model_type not in MODEL_REGISTRY:
        raise ValueError(
            f"Unsupported request type: {model_type}"
        )

    return MODEL_REGISTRY[model_type]


# ============================================================
# MODEL ROUTER
# ============================================================

def route_request(
    messages: list,
    request_type: str = "text",
    user_id: int | None = None,
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
            details="Local model selected by router",
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
                details="Local model inference completed",
            )

            return {
                "response": response,
                "model": model["name"],
                "model_type": model["type"],
                "is_local": model["local"],
            }

        elif request_type == "embedding":

            # RAG module will call the embedding model
            return {
                "model": model["name"],
                "model_type": model["type"],
                "is_local": model["local"],
            }

    except Exception as e:

        # Audit failed request
        log_event(
            user_id=user_id,
            action="REQUEST_FAILED",
            model=MODEL_REGISTRY.get(
                request_type,
                {},
            ).get("name"),
            resource=request_type,
            success=False,
            external_call=False,
            details=str(e),
        )

        raise


# ============================================================
# AGENT RESPONSE BUILDER
# ============================================================

def _build_agent_response(
    agent_result: dict,
) -> str:
    """
    Convert the agent execution result
    into the final response text.
    """

    results = agent_result.get("results", [])

    if not results:
        return "The agent could not produce a result."

    # For the current Phase-1 agent,
    # use the first execution result.
    first_result = results[0]

    result = first_result.get("result", {})

    if isinstance(result, dict):

        answer = result.get("answer")

        if answer:
            return answer

    if isinstance(result, str):
        return result

    return (
        "The agent completed the requested operation "
        "but produced no response."
    )


# ============================================================
# CHAT ENDPOINT
# ============================================================

@api_router.post(
    "/api/chat",
    response_model=ChatResponse,
)
def chat(payload: ChatRequest) -> ChatResponse:

    message_text = payload.message.strip()

    if not message_text:
        raise HTTPException(
            status_code=400,
            detail="Message is required.",
        )

    user_id = payload.user_id or 1
    conv_id = payload.conversation_id

    try:

        # 1. Ensure conversation exists
        if conv_id is None:

            conv_id = db_repo.create_conversation(
                user_id=user_id,
                title=(
                    f"Chat "
                    f"{datetime.now().strftime('%Y-%m-%d %H:%M')}"
                ),
            )

        # 2. Store user message
        db_repo.add_message(
            conversation_id=conv_id,
            sender="user",
            text=message_text,
        )

        # 3. Run the agent
        agent_result = run_agent(message_text)

        # 4. Extract final response
        response_text = _build_agent_response(
            agent_result
        )

        # 5. Store assistant message
        db_repo.add_message(
            conversation_id=conv_id,
            sender="assistant",
            text=response_text,
        )

        return ChatResponse(
            response=response_text
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to complete the local AI request: "
                f"{str(e)}"
            ),
        )


# ============================================================
# APPROVAL NOTE ENDPOINT
# ============================================================

@api_router.post("/api/approval-note")
def generate_approval_note_endpoint(
    payload: ApprovalNoteRequest,
):
    """
    Run the Phase-1 agent workflow and generate
    a review-ready approval note DOCX.
    """

    message_text = payload.message.strip()

    if not message_text:
        raise HTTPException(
            status_code=400,
            detail="Message is required.",
        )

    try:

        # 1. Run the same agent workflow
        agent_result = run_agent(message_text)

        # 2. Convert agent output into
        #    structured approval-note data
        note_data = build_approval_note_data(
            agent_result
        )

        # 3. Local generated-document directory
        output_dir = (
            Path("backend") / "generated"
        )

        output_path = (
            output_dir / "approval_note.docx"
        )

        # 4. Generate DOCX
        generate_approval_note(
            output_path=output_path,
            title=note_data["title"],
            query=note_data["query"],
            task=note_data["task"],
            summary=note_data["summary"],
            verification_status=(
                note_data["verification_status"]
            ),
            checks=note_data["checks"],
            evidence=note_data["evidence"],
        )

        # 5. Return generated DOCX
        return FileResponse(
            path=output_path,
            media_type=(
                "application/"
                "vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
            filename="approval_note.docx",
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to generate the approval note: "
                f"{str(e)}"
            ),
        )