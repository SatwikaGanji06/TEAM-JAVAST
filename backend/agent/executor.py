from typing import Any
import os
import re

from backend.models.qwen import ask_qwen
from backend.services.rag_service import query_rag
from backend.tools.calculator import calculate
from backend.tools.document_reader import read_document
from backend.database.connection import get_connection


def execute_step(
    step: dict[str, Any],
    document_ids: list[int] | None = None,
    execution_results: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """
    Execute one planned agent step using a local tool.

    Industrial analysis workflow:
        document_reader -> rag_search -> calculator
    """

    action = step.get("action")

    # ---------------------------------------------------------
    # RAG SEARCH
    # ---------------------------------------------------------
    if action == "rag_search":
        result = query_rag(
            step["query"],
            document_ids=document_ids,
        )

        return {
            "action": action,
            "success": True,
            "result": result,
        }

    # ---------------------------------------------------------
    # DOCUMENT READER
    # ---------------------------------------------------------
    if action == "document_reader":
        file_path = step.get("file_path")

        if not file_path and document_ids:
            # Resolve the stored filename from the documents table.
            with get_connection() as conn:
                with conn.cursor() as cur:
                    # Resolve the inspection/report document from the
                    # selected document IDs instead of assuming the first
                    # selected document is the inspection report.
                    placeholders = ",".join(["%s"] * len(document_ids))

                    cur.execute(
                        f"""
                        SELECT document_id, file_name
                        FROM documents
                        WHERE document_id IN ({placeholders})
                        ORDER BY document_id
                        """,
                        tuple(document_ids),
                    )

                    rows = cur.fetchall()

                    inspection_row = next(
                        (
                            row
                            for row in rows
                            if any(
                                keyword in (row[1] or "").lower()
                                for keyword in (
                                    "inspection",
                                    "inspection_report",
                                    "report",
                                )
                            )
                        ),
                        None,
                    )

                    selected_row = inspection_row or (rows[0] if rows else None)

                    if selected_row and selected_row[1]:
                        file_name = selected_row[1]

                        # Documents uploaded by this RAG pipeline
                        # are stored under rag/data/raw.
                        project_root = os.path.abspath(
                            os.path.join(
                                os.path.dirname(__file__),
                                "..",
                                "..",
                            )
                        )

                        file_path = os.path.join(
                            project_root,
                            "rag",
                            "data",
                            "raw",
                            file_name,
                        )

        if not file_path:
            raise ValueError(
                "file_path is required for document_reader."
            )

        if not os.path.exists(file_path):
            raise FileNotFoundError(
                f"Document file not found: {file_path}"
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

    # ---------------------------------------------------------
    # DETERMINISTIC INDUSTRIAL CALCULATOR
    # ---------------------------------------------------------
    if action == "calculator":

        if step.get("mode") == "deviation_analysis":

            inspection_text = ""
            rag_text = ""

            # Collect outputs from previous workflow steps.
            for res in (execution_results or []):

                if res.get("action") == "document_reader":
                    inspection_text = (
                        res.get("result", {}).get("text", "") or ""
                    )

                elif res.get("action") == "rag_search":
                    rag_result = res.get("result", {}) or {}
                    rag_text = rag_result.get("answer", "") or ""

                    for source in rag_result.get("sources", []) or []:
                        source_content = source.get("content", "") or ""
                        if source_content:
                            rag_text += "\n" + source_content

            calculations = []

            # -------------------------------------------------
            # DRIVE-END VIBRATION
            # -------------------------------------------------
            vibration_match = re.search(
                r"drive-end vibration\s+"
                r"(?:[:\-]\s*)?"
                r"([0-9]+(?:\.[0-9]+)?)",
                inspection_text,
                re.IGNORECASE,
            )

            vibration_limit_match = re.search(
                r"drive-end vibration\s*"
                r"(?:≤|<=)\s*"
                r"([0-9]+(?:\.[0-9]+)?)",
                rag_text,
                re.IGNORECASE,
            )

            if vibration_match and vibration_limit_match:

                measured = vibration_match.group(1)
                limit = vibration_limit_match.group(1)

                expression = f"{measured} - {limit}"

                calculations.append({
                    "label": "Drive-end vibration deviation",
                    "expression": expression,
                    "value": calculate(expression),
                    "unit": "mm/s RMS",
                })

            # -------------------------------------------------
            # DRIVE-END BEARING TEMPERATURE
            # -------------------------------------------------
            temperature_match = re.search(
                r"drive-end bearing temp(?:erature)?\s+"
                r"(?:[:\-]\s*)?"
                r"([0-9]+(?:\.[0-9]+)?)",
                inspection_text,
                re.IGNORECASE,
            )

            temperature_limit_match = re.search(
                r"drive-end bearing temp(?:erature)?\s*"
                r"(?:≤|<=)\s*"
                r"([0-9]+(?:\.[0-9]+)?)",
                rag_text,
                re.IGNORECASE,
            )

            if temperature_match and temperature_limit_match:

                measured = temperature_match.group(1)
                limit = temperature_limit_match.group(1)

                expression = f"{measured} - {limit}"

                calculations.append({
                    "label": "Drive-end bearing temperature deviation",
                    "expression": expression,
                    "value": calculate(expression),
                    "unit": "°C",
                })

            return {
                "action": action,
                "success": True,
                "result": {
                    "calculations": calculations,
                },
            }

        # -----------------------------------------------------
        # NORMAL SIMPLE CALCULATOR
        # -----------------------------------------------------
        expression = (
            step.get("expression")
            or step.get("query")
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

    # ---------------------------------------------------------
    # NORMAL LOCAL LLM RESPONSE
    # ---------------------------------------------------------
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

    raise ValueError(
        f"Unsupported agent action: {action}"
    )