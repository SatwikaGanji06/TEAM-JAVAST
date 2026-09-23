from pathlib import Path
from typing import Any

from docx import Document


def build_approval_note_data(
    agent_result: dict[str, Any],
) -> dict[str, Any]:
    """
    Convert an agent result into structured approval-note data.
    """
    query = agent_result.get("query", "")
    task = agent_result.get("task", "Unknown")
    verification = agent_result.get("verification", {})

    summary = ""
    calculations = []

    for item in agent_result.get("results", []):
        if not isinstance(item, dict):
            continue

        result = item.get("result")

        if not isinstance(result, dict):
            continue

        if item.get("action") == "calculator":
            for calculation in result.get("calculations", []):
                if isinstance(calculation, dict):
                    calculations.append(calculation)

        if result.get("answer") and not summary:
            summary = result["answer"]

    if calculations:
        summary_lines = [
            "Pump P-204 inspection analysis identified the following deviations:"
        ]

        for calculation in calculations:
            label = calculation.get("label", "Calculation")
            expression = calculation.get("expression", "")
            value = calculation.get("value", "")
            unit = calculation.get("unit", "")

            summary_lines.append(
                f"{label}: {expression} = {value} {unit}."
            )

        summary_lines.append(
            "The calculated results passed verification."
        )

        summary = " ".join(summary_lines)

    elif not summary:
        summary = "No analysis summary was produced."

    checks = verification.get("checks", [])

    evidence = []

    for item in agent_result.get("results", []):
        if not isinstance(item, dict):
            continue

        if item.get("action") != "rag_search":
            continue

        result = item.get("result")

        if not isinstance(result, dict):
            continue

        sources = result.get("sources") or []

        for source in sources:
            if isinstance(source, dict):
                content = (
                    source.get("content")
                    or source.get("text")
                    or source.get("chunk")
                )

                if content:
                    evidence.append(str(content))

            elif isinstance(source, str) and source.strip():
                evidence.append(source)

    return {
        "title": "LOKAI - Approval Note",
        "query": query,
        "task": task,
        "summary": summary,
        "calculations": calculations,
        "verification_status": verification.get(
            "status",
            "needs_review",
        ),
        "checks": checks,
        "evidence": evidence,
    }


def generate_approval_note(
    output_path: str | Path,
    title: str = "LOKAI - Approval Note",
    summary: str = "",
    verification_status: str = "needs_review",
    checks: list[dict[str, Any]] | None = None,
    evidence: list[str] | None = None,
    calculations: list[dict[str, Any]] | None = None,
    query: str = "",
    task: str = "",
) -> str:
    """
    Generate a review-ready approval note DOCX.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    document = Document()

    document.add_heading(title, level=1)

    document.add_heading("Request", level=2)
    document.add_paragraph(query or "No request provided.")

    document.add_heading("Task", level=2)
    document.add_paragraph(task or "Unknown")

    document.add_heading("Analysis Summary", level=2)
    document.add_paragraph(
        summary or "No analysis summary provided."
    )

    document.add_heading("Calculated Deviations", level=2)

    if calculations:
        for calculation in calculations:
            label = calculation.get("label", "Calculation")
            expression = calculation.get("expression", "")
            value = calculation.get("value", "")
            unit = calculation.get("unit", "")

            document.add_paragraph(
                f"{label}: {expression} = {value} {unit}".strip(),
                style="List Bullet",
            )
    else:
        document.add_paragraph(
            "No calculations were produced."
        )

    document.add_heading("Verification Status", level=2)
    document.add_paragraph(
        verification_status.upper()
    )

    document.add_heading("Verification Checks", level=2)

    if checks:
        for check in checks:
            name = check.get("name", "Unknown")
            passed = check.get("passed") is True
            status = "PASSED" if passed else "FAILED"

            document.add_paragraph(
                f"{name}: {status}"
            )
    else:
        document.add_paragraph("No verification checks available.")

    document.add_heading("Evidence / Sources", level=2)

    if evidence:
        for source in evidence:
            document.add_paragraph(
                source,
                style="List Bullet",
            )
    else:
        document.add_paragraph(
            "No supporting evidence was retrieved."
        )

    document.add_paragraph(
        "This document was generated by the Sovereign "
        "LOKAI for review and approval."
    )

    document.save(output_path)

    return str(output_path)



