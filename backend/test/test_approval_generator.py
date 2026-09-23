from pathlib import Path

from docx import Document

from backend.approval.generator import generate_approval_note


def test_generate_approval_note(tmp_path):
    output_path = tmp_path / "approval_note.docx"

    result = generate_approval_note(
        output_path,
        summary="Pump temperature exceeded the acceptable operating limit.",
    )

    assert result == str(output_path)
    assert output_path.exists()


def test_generated_document_contains_expected_content(tmp_path):
    output_path = tmp_path / "approval_note.docx"

    generate_approval_note(
        output_path,
        summary="Inspection analysis completed successfully.",
    )

    document = Document(output_path)

    text = "\n".join(
        paragraph.text
        for paragraph in document.paragraphs
    )

    assert "LOKAI" in text
    assert "Analysis Summary" in text
    assert "Inspection analysis completed successfully." in text
    assert "NEEDS_REVIEW" in text
from backend.approval.generator import build_approval_note_data


def test_build_approval_note_data_from_agent_result():
    agent_result = {
        "query": "Analyze the pump inspection report.",
        "task": "tool_analysis",
        "results": [
            {
                "action": "rag_search",
                "success": True,
                "result": {
                    "answer": "The pump temperature exceeded the operating limit."
                },
            }
        ],
        "verification": {
            "status": "verified",
        },
    }

    result = build_approval_note_data(agent_result)

    assert result["title"] == "LOKAI - Approval Note"
    assert result["query"] == "Analyze the pump inspection report."
    assert result["task"] == "tool_analysis"
    assert result["summary"] == (
        "The pump temperature exceeded the operating limit."
    )
    assert result["verification_status"] == "verified"


def test_build_approval_note_data_handles_missing_summary():
    agent_result = {
        "query": "Analyze the document.",
        "task": "tool_analysis",
        "results": [],
        "verification": {
            "status": "needs_review",
        },
    }

    result = build_approval_note_data(agent_result)

    assert result["summary"] == "No analysis summary was produced."
    assert result["verification_status"] == "needs_review"
from docx import Document

from backend.approval.generator import (
    build_approval_note_data,
    generate_approval_note,
)


def test_build_approval_note_includes_verification_and_evidence():
    agent_result = {
        "query": "Analyze the pump inspection report.",
        "task": "tool_analysis",
        "results": [
            {
                "action": "rag_search",
                "success": True,
                "result": {
                    "answer": "Pump temperature is above the limit.",
                    "sources": [
                        {
                            "content": "Maximum pump temperature is 95 C."
                        }
                    ],
                },
            }
        ],
        "verification": {
            "status": "verified",
            "checks": [
                {
                    "name": "evidence",
                    "passed": True,
                },
                {
                    "name": "consistency",
                    "passed": True,
                },
            ],
        },
    }

    result = build_approval_note_data(agent_result)

    assert result["verification_status"] == "verified"
    assert len(result["checks"]) == 2
    assert len(result["evidence"]) == 1
    assert "95 C" in result["evidence"][0]


def test_generated_docx_contains_verification_and_evidence(tmp_path):
    output_path = tmp_path / "approval_note.docx"

    generate_approval_note(
        output_path,
        query="Analyze the pump inspection report.",
        task="tool_analysis",
        summary="Pump temperature is above the limit.",
        verification_status="verified",
        checks=[
            {
                "name": "evidence",
                "passed": True,
            },
            {
                "name": "calculation",
                "passed": True,
            },
        ],
        evidence=[
            "Maximum pump temperature is 95 C."
        ],
    )

    document = Document(output_path)

    text = "\n".join(
        paragraph.text
        for paragraph in document.paragraphs
    )

    assert "VERIFIED" in text
    assert "evidence: PASSED" in text
    assert "calculation: PASSED" in text
    assert "Maximum pump temperature is 95 C." in text


def test_failed_verification_is_visible_in_docx(tmp_path):
    output_path = tmp_path / "approval_note.docx"

    generate_approval_note(
        output_path,
        verification_status="needs_review",
        checks=[
            {
                "name": "calculation",
                "passed": False,
            }
        ],
    )

    document = Document(output_path)

    text = "\n".join(
        paragraph.text
        for paragraph in document.paragraphs
    )

    assert "NEEDS_REVIEW" in text
    assert "calculation: FAILED" in text
from pathlib import Path

from docx import Document

from backend.approval.generator import (
    build_approval_note_data,
    generate_approval_note,
)


def _read_docx_text(path: Path) -> str:
    document = Document(path)

    return "\n".join(
        paragraph.text
        for paragraph in document.paragraphs
    )


def test_verified_agent_result_produces_complete_docx(tmp_path):
    agent_result = {
        "query": "Analyze pump inspection.",
        "task": "tool_analysis",
        "results": [
            {
                "action": "rag_search",
                "success": True,
                "result": {
                    "answer": "Pump temperature is within the acceptable range.",
                    "sources": [
                        {
                            "content": "Pump operating limit is 95 C."
                        }
                    ],
                },
            },
            {
                "action": "calculator",
                "success": True,
                "result": {
                    "expression": "90 - 95",
                    "value": -5,
                },
            },
        ],
        "verification": {
            "status": "verified",
            "checks": [
                {
                    "name": "consistency",
                    "passed": True,
                },
                {
                    "name": "calculation",
                    "passed": True,
                },
                {
                    "name": "evidence",
                    "passed": True,
                },
            ],
        },
    }

    note_data = build_approval_note_data(agent_result)

    output_path = tmp_path / "verified_approval_note.docx"

    generate_approval_note(
        output_path=output_path,
        title=note_data["title"],
        query=note_data["query"],
        task=note_data["task"],
        summary=note_data["summary"],
        verification_status=note_data["verification_status"],
        checks=note_data["checks"],
        evidence=note_data["evidence"],
    )

    assert output_path.exists()

    text = _read_docx_text(output_path)

    assert "Analyze pump inspection." in text
    assert "tool_analysis" in text
    assert "Pump temperature is within the acceptable range." in text
    assert "VERIFIED" in text
    assert "consistency: PASSED" in text
    assert "calculation: PASSED" in text
    assert "evidence: PASSED" in text
    assert "Pump operating limit is 95 C." in text


def test_needs_review_status_is_preserved_end_to_end(tmp_path):
    agent_result = {
        "query": "Verify pump calculation.",
        "task": "tool_analysis",
        "results": [
            {
                "action": "calculator",
                "success": True,
                "result": {
                    "expression": "102 - 95",
                    "value": 8,
                },
            }
        ],
        "verification": {
            "status": "needs_review",
            "checks": [
                {
                    "name": "consistency",
                    "passed": True,
                },
                {
                    "name": "calculation",
                    "passed": False,
                },
            ],
        },
    }

    note_data = build_approval_note_data(agent_result)

    output_path = tmp_path / "review_approval_note.docx"

    generate_approval_note(
        output_path=output_path,
        title=note_data["title"],
        query=note_data["query"],
        task=note_data["task"],
        summary=note_data["summary"],
        verification_status=note_data["verification_status"],
        checks=note_data["checks"],
        evidence=note_data["evidence"],
    )

    assert output_path.exists()

    text = _read_docx_text(output_path)

    assert "NEEDS_REVIEW" in text
    assert "calculation: FAILED" in text


def test_docx_is_readable_after_generation(tmp_path):
    output_path = tmp_path / "readable_approval_note.docx"

    generate_approval_note(
        output_path=output_path,
        query="Check inspection findings.",
        task="tool_analysis",
        summary="Inspection completed.",
        verification_status="verified",
        checks=[
            {
                "name": "consistency",
                "passed": True,
            }
        ],
        evidence=[
            "Inspection report section 4."
        ],
    )

    document = Document(output_path)

    assert len(document.paragraphs) > 0

    text = _read_docx_text(output_path)

    assert "Inspection completed." in text
    assert "VERIFIED" in text
    assert "Inspection report section 4." in text

