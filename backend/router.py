import logging
from datetime import datetime
from pathlib import Path
import uuid
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
from backend.security.audit import log_event, get_audit_events


api_router = APIRouter()
db_repo = DatabaseRepository()


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    conversation_id: Optional[int] = None
    user_id: Optional[int] = 1


class AgentAnalyzeRequest(BaseModel):
    query: str = Field(min_length=1)
    document_ids: Optional[list[int]] = None
    user_id: Optional[int] = 1


class ChatResponse(BaseModel):

    response: str


class ApprovalNoteRequest(BaseModel):
    message: str = Field(min_length=1)
    document_ids: Optional[list[int]] = None


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

def _build_agent_response(agent_result: dict) -> str:
    results = agent_result.get("results", [])

    if not results:
        return "The agent could not produce a result."

    # Prefer a synthesized LLM response when available.
    for item in results:
        if not isinstance(item, dict):
            continue

        if item.get("action") == "llm_response":
            result = item.get("result") or {}

            if isinstance(result, dict):
                answer = result.get("answer")

                if answer:
                    return str(answer)

    # Deterministic calculator result.
    for item in results:
        if not isinstance(item, dict):
            continue

        if item.get("action") == "calculator":
            result = item.get("result") or {}

            if isinstance(result, dict) and "value" in result:
                expression = result.get("expression", "")
                value = result.get("value")

                if expression:
                    return f"{expression} = {value}"

                return str(value)

    # Document reader result.
    for item in results:
        if not isinstance(item, dict):
            continue

        if item.get("action") == "document_reader":
            result = item.get("result") or {}

            if isinstance(result, dict):
                document_text = result.get("text")

                if document_text:
                    return str(document_text)

    # RAG result.
    for item in results:
        if not isinstance(item, dict):
            continue

        if item.get("action") == "rag_search":
            result = item.get("result") or {}

            if isinstance(result, dict):
                answer = result.get("answer")

                if answer:
                    return str(answer)

                sources = result.get("sources") or []

                if sources:
                    return "Relevant evidence was retrieved from the knowledge base."

    return (
        "The agent completed the requested operation "
        "but produced no response."
    )

@api_router.post(
    "/api/agent/analyze",
    response_model=dict,
)
def agent_analyze(payload: AgentAnalyzeRequest):
    """
    Run the full agent pipeline, persist the execution as a run,
    and return the complete agent result.
    """
    try:
        result = run_agent(
            payload.query,
            document_ids=payload.document_ids
        )

        verification = result.get("verification") or {}
        status = verification.get("status", "unknown")

        run_id = db_repo.create_run(
            user_id=payload.user_id,
            query=result.get("query", payload.query),
            task=result.get("task", "unknown"),
            status=status,
            document_ids=payload.document_ids,
            plan=result.get("plan", []),
            results=result.get("results", []),
            verification=verification,
        )

        result["run_id"] = run_id
        return result

    except Exception as e:
        logging.exception("Agent analysis failed")
        raise HTTPException(
            status_code=503,
            detail=f"Unable to complete agent analysis: {str(e)}"
        )
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
        agent_result = run_agent(
            message_text,
        )

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

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

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
# AUDIT ENDPOINT
# ============================================================

@api_router.get("/api/audit")
def get_audit_log(limit: int = 100):
    """Return recent local audit events."""
    limit = max(1, min(limit, 500))
    return {"events": get_audit_events(limit)}
# ============================================================

@api_router.post("/api/approval-note")
def generate_approval_note_endpoint(payload: ApprovalNoteRequest):
    message_text = payload.message.strip()

    if not message_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        agent_result = run_agent(
            message_text,
            document_ids=payload.document_ids,
        )
        note_data = build_approval_note_data(agent_result)

        output_dir = Path("backend") / "generated"
        output_dir.mkdir(parents=True, exist_ok=True)

        unique_name = f"LOKAI_Approval_Note_{uuid.uuid4().hex[:10]}.docx"
        output_path = output_dir / unique_name

        generate_approval_note(
            output_path=output_path,
            title=note_data["title"],
            query=note_data["query"],
            task=note_data["task"],
            summary=note_data["summary"],
            verification_status=note_data["verification_status"],
            checks=note_data["checks"],
            evidence=note_data["evidence"],
            calculations=note_data["calculations"],
        )

        generated_document_id = None
        try:
            repository = DatabaseRepository()
            generated_document_id = repository.create_generated_document(
                filename=unique_name,
                document_type="approval_note",
                file_path=str(output_path.resolve()),
                source_query=message_text,
                document_ids=payload.document_ids,
            )
        except Exception:
            # Document generation must remain available even if
            # persistence is temporarily unavailable.
            generated_document_id = None

        response = FileResponse(
            path=output_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=unique_name,
        )

        if generated_document_id is not None:
            response.headers["X-Generated-Document-ID"] = str(generated_document_id)

        return response

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate approval note: {exc}",
        )


@api_router.get("/api/generated-documents")
def list_generated_documents():
    repository = DatabaseRepository()
    rows = repository.get_generated_documents()

    return [
        {
            "document_id": row[0],
            "filename": row[1],
            "document_type": row[2],
            "file_path": row[3],
            "source_query": row[4],
            "document_ids": row[5],
            "created_at": row[6],
            "download_url": f"/api/generated-documents/{row[0]}/download",
        }
        for row in rows
    ]


@api_router.get("/api/generated-documents/{document_id}/download")
def download_generated_document(document_id: int):
    repository = DatabaseRepository()
    row = repository.get_generated_document(document_id)

    if not row:
        raise HTTPException(status_code=404, detail="Generated document not found.")

    file_path = Path(row[3]).resolve()
    generated_root = (Path("backend") / "generated").resolve()

    try:
        file_path.relative_to(generated_root)
    except ValueError:
        raise HTTPException(status_code=404, detail="Generated document not found.")

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Generated document file not found.")

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=row[1],
    )

@api_router.get("/api/generated-documents")
def list_generated_documents():
    repository = DatabaseRepository()
    rows = repository.get_generated_documents()

    return [
        {
            "document_id": row[0],
            "filename": row[1],
            "document_type": row[2],
            "file_path": row[3],
            "source_query": row[4],
            "document_ids": row[5],
            "created_at": row[6],
            "download_url": f"/api/generated-documents/{row[0]}/download",
        }
        for row in rows
    ]


@api_router.get("/api/generated-documents/{document_id}/download")
def download_generated_document(document_id: int):
    repository = DatabaseRepository()
    row = repository.get_generated_document(document_id)

    if not row:
        raise HTTPException(status_code=404, detail="Generated document not found.")

    file_path = Path(row[3]).resolve()
    generated_root = (Path("backend") / "generated").resolve()

    try:
        file_path.relative_to(generated_root)
    except ValueError:
        raise HTTPException(status_code=404, detail="Generated document not found.")

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Generated document file not found.")

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=row[1],
    )

@api_router.get("/api/runs")
def list_runs(limit: int = 100):
    repository = DatabaseRepository()
    rows = repository.get_runs(limit=limit)

    return rows


@api_router.get("/api/runs/{run_id}")
def get_run(run_id: int):
    repository = DatabaseRepository()
    row = repository.get_run(run_id)

    if not row:
        raise HTTPException(status_code=404, detail="Run not found.")

    return row






