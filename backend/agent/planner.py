from typing import Any


def create_plan(query: str) -> dict[str, Any]:
    """
    Create a deterministic execution plan.

    The planner identifies whether the request needs:
    - document reading,
    - internal RAG search,
    - calculation,
    - or normal local LLM response.
    """

    question = (query or "").strip()

    if not question:
        raise ValueError("Query is required.")

    lowered = question.lower()

    calculation_keywords = [
        "calculate",
        "calculation",
        "compute",
        "percentage",
        "deviation",
        "difference",
        "ratio",
    ]

    document_keywords = [
        "read this document",
        "inspection document",
        "read the document",
        "extract from the document",
        "extract measurements",
        "extract the measurements",
        "inspection file",
        "uploaded file",
    ]

    knowledge_keywords = [
        "document",
        "report",
        "sop",
        "manual",
        "procedure",
        "policy",
        "inspection report",
        "inspection findings",
        "operating limit",
        "acceptable limit",
        "according to the document",
        "according to the report",
        "according to the sop",
        "according to the manual",
        "in the report",
        "in the sop",
        "compare with",
    ]

    requires_calculation = any(
        keyword in lowered
        for keyword in calculation_keywords
    )

    requires_document = any(
        keyword in lowered
        for keyword in document_keywords
    )

    requires_rag = any(
        keyword in lowered
        for keyword in knowledge_keywords
    )

    steps = []

    if requires_document:
        steps.append({
            "step": len(steps) + 1,
            "action": "document_reader",
            "description": (
                "Read the supplied local document "
                "and extract its text."
            ),
            "query": question,
        })

    if requires_rag:
        steps.append({
            "step": len(steps) + 1,
            "action": "rag_search",
            "description": (
                "Search indexed internal documents "
                "for relevant evidence."
            ),
            "query": question,
        })

    if requires_calculation:
        steps.append({
            "step": len(steps) + 1,
            "action": "calculator",
            "description": (
                "Perform the required deterministic calculation."
            ),
            "query": question,
        })

    if steps:
        return {
            "task": "tool_analysis",
            "steps": steps,
        }

    return {
        "task": "general_chat",
        "steps": [
            {
                "step": 1,
                "action": "llm_response",
                "description": (
                    "Generate a response using the local "
                    "language model."
                ),
                "query": question,
            }
        ],
    }
