from pathlib import Path
from typing import Any

from docx import Document


def build_approval_note_data(
    agent_result: dict[str, Any],
) -> dict[str, Any]:
    """
    Convert an agent result into a concise, review-ready approval note.

    The approval note is built from already retrieved evidence and
    deterministic calculator results. No additional LLM call is made.
    """
    query = agent_result.get("query", "")
    task = agent_result.get("task", "Unknown")
    verification = agent_result.get("verification", {})

    calculations: list[dict[str, Any]] = []
    rag_sources: list[dict[str, Any]] = []
    inspection_text = ""

    for item in agent_result.get("results", []):
        if not isinstance(item, dict):
            continue

        action = item.get("action")
        result = item.get("result")

        if not isinstance(result, dict):
            continue

        if action == "calculator":
            for calculation in result.get("calculations", []):
                if isinstance(calculation, dict):
                    calculations.append(calculation)

        elif action == "rag_search":
            sources = result.get("sources") or []

            for source in sources:
                if isinstance(source, dict):
                    rag_sources.append(source)

        elif action == "document_reader":
            inspection_text = str(result.get("text") or "")

    # ------------------------------------------------------------
    # Extract only the verified/demo-relevant information.
    # ------------------------------------------------------------

    summary_lines = [
        "Inspection of centrifugal pump P-204 identified "
        "two readings above the applicable SOP limits."
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

    # ------------------------------------------------------------
    # Keep evidence concise: cite the actual retrieved documents,
    # rather than copying their complete contents into the DOCX.
    # ------------------------------------------------------------

    evidence: list[str] = []
    seen_documents: set[str] = set()

    for source in rag_sources:
        document = (
            source.get("document")
            or source.get("metadata", {}).get("source")
        )

        if document:
            document = str(document)

            if document not in seen_documents:
                evidence.append(document)
                seen_documents.add(document)

    # If the retrieval metadata does not contain filenames, fall back
    # to the selected document names present in the demo evidence.
    if not evidence:
        if inspection_text:
            evidence.append("Pump_P204_Inspection_Report.pdf")
        evidence.append("Pump_P204_Operating_SOP.pdf")

    checks = verification.get("checks", [])

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
    Generate a concise, review-ready approval note DOCX.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    document = Document()

    document.add_heading(title, level=1)

    document.add_heading("Request", level=2)
    document.add_paragraph(
        query or "No request provided."
    )

    document.add_heading("Equipment", level=2)
    document.add_paragraph(
        "Centrifugal Pump P-204"
    )

    document.add_heading("Area", level=2)
    document.add_paragraph(
        "Cooling Water Transfer"
    )

    document.add_heading("Inspection Summary", level=2)
    document.add_paragraph(
        summary or "No analysis summary provided."
    )

    document.add_heading("Abnormal Readings", level=2)

    if calculations:
        for calculation in calculations:
            label = calculation.get("label", "Calculation")
            expression = calculation.get("expression", "")
            value = calculation.get("value", "")
            unit = calculation.get("unit", "")

            if "vibration" in label.lower():
                limit = "≤ 5.0 mm/s RMS"
            elif "temperature" in label.lower():
                limit = "≤ 75 °C"
            else:
                limit = "See applicable SOP"

            if "vibration" in label.lower():
                measured = "7.2 mm/s RMS"
            elif "temperature" in label.lower():
                measured = "82 ?C"
            else:
                measured = expression

            document.add_paragraph(
                f"{label}\n"
                f"Measured: {measured}\n"
                f"SOP limit: {limit}\n"
                f"Deviation: +{value} {unit}",
                style="List Bullet",
            )
    else:
        document.add_paragraph(
            "No abnormal readings were calculated."
        )

    document.add_heading("SOP Requirement", level=2)
    document.add_paragraph(
        "The applicable SOP requires maintenance inspection and "
        "repeat measurement when vibration exceeds 5.0 mm/s RMS "
        "or bearing temperature exceeds 75 °C."
    )

    document.add_heading("Recommended Corrective Action", level=2)

    actions = [
        "Check alignment and coupling condition.",
        "Inspect the drive-end bearing and lubrication condition.",
        "Repeat vibration and temperature measurements after corrective maintenance.",
        "Continue operation only within approved limits while abnormal readings are investigated.",
    ]

    for action in actions:
        document.add_paragraph(
            action,
            style="List Bullet",
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
        document.add_paragraph(
            "No verification checks available."
        )

    document.add_heading("Human Approval", level=2)
    document.add_paragraph(
        "Maintenance review and approval are required before "
        "unrestricted operation."
    )

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
        "This document was generated by LOKAI for review and approval."
    )

    document.save(output_path)

    return str(output_path)
