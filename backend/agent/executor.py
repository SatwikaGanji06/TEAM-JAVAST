from typing import Any

from backend.models.qwen import ask_qwen
from backend.services.rag_service import query_rag
from backend.tools.calculator import calculate
from backend.tools.document_reader import read_document


def execute_step(step: dict[str, Any]) -> dict[str, Any]:
    """
    Execute one planned agent step using a local tool.
    """

    action = step.get("action")

    if action == "rag_search":
        result = query_rag(step["query"])

        return {
            "action": action,
            "success": True,
            "result": result,
        }

    if action == "calculator":
        expression = step.get("expression") or step.get("query")

        result = calculate(expression)

        return {
            "action": action,
            "success": True,
            "result": {
                "value": result,
                "expression": expression,
            },
        }

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

    if action == "llm_response":
        answer = ask_qwen([
            {
                "role": "user",
                "content": step["query"],
            }
        ])

        return {
            "action": action,
            "success": True,
            "result": {
                "answer": answer,
                "sources": [],
            },
        }

    raise ValueError(f"Unsupported agent action: {action}")
