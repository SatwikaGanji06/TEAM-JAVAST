import re
from typing import Any

from backend.models.qwen import ask_qwen
from backend.services.rag_service import query_rag
from backend.tools.calculator import calculate
from backend.tools.document_reader import read_document


def _extract_calculation_expression(query: str) -> str:
    """
    Extract a supported calculation expression from a
    natural-language request.

    Examples:
        "Calculate 15% of 800"
            -> "15% of 800"

        "What is 20 percent of 500?"
            -> "20 percent of 500"

        "100/15"
            -> "100/15"
    """

    question = (query or "").strip()

    percentage_match = re.search(
        r"\d+(?:\.\d+)?\s*"
        r"(?:%|percent|percentage)\s+of\s+"
        r"\d+(?:\.\d+)?",
        question,
        re.IGNORECASE,
    )

    if percentage_match:
        return percentage_match.group(0)

    return question


def execute_step(step: dict[str, Any]) -> dict[str, Any]:
    """
    Execute one planned agent step using a local tool.
    """

    action = step.get("action")

    # ========================================================
    # RAG
    # ========================================================

    if action == "rag_search":

        result = query_rag(step["query"])

        return {
            "action": action,
            "success": True,
            "result": result,
        }

    # ========================================================
    # CALCULATOR
    # ========================================================

    if action == "calculator":

        expression = (
            step.get("expression")
            or _extract_calculation_expression(
                step.get("query", "")
            )
        )

        result = calculate(expression)

        return {
            "action": action,
            "success": True,
            "result": {
                "value": result,
                "expression": expression,
            },
        }

    # ========================================================
    # DOCUMENT READER
    # ========================================================

    if action == "document_reader":

        file_path = step.get("file_path")

        if not file_path:
            raise ValueError(
                "file_path is required for document_reader."
            )

        text = read_document(file_path)

        return {
            "action": action,
            "success": True,
            "result": {
                "text": text,
                "file_path": file_path,
            },
        }

    # ========================================================
    # GENERAL / FINAL LLM
    # ========================================================

    if action == "llm_response":

        answer = ask_qwen(
            [
                {
                    "role": "user",
                    "content": step["query"],
                }
            ]
        )

        return {
            "action": action,
            "success": True,
            "result": {
                "answer": answer,
                "sources": [],
            },
        }

    raise ValueError(
        f"Unsupported agent action: {action}"
    )