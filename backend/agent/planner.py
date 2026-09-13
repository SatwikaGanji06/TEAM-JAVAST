from typing import Any


def create_plan(query: str) -> dict[str, Any]:
    """
    Create a deterministic execution plan.

    The planner decides whether the request needs:
    - internal RAG search,
    - calculation,
    - or normal local LLM response.

    The final answer is always synthesized by Qwen3:4B.
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
        "average",
        "sum",
        "subtract",
        "multiply",
        "divide",
    ]

    knowledge_keywords = [
        "document",
        "documents",
        "report",
        "reports",
        "sop",
        "manual",
        "procedure",
        "policy",
        "inspection",
        "inspection report",
        "inspection findings",
        "findings",
        "measurement",
        "measurements",
        "operating limit",
        "acceptable limit",
        "limit",
        "according to the document",
        "according to the report",
        "according to the sop",
        "according to the manual",
        "in the document",
        "in the report",
        "in the sop",
        "in the manual",
        "uploaded document",
        "uploaded file",
        "uploaded report",
        "summarize the document",
        "summarize this document",
        "summarize the report",
        "analyze the document",
        "analyse the document",
        "analyze this document",
        "analyse this document",
        "document summary",
        "document analysis",
        "compare with",
    ]

    requires_calculation = any(
        keyword in lowered
        for keyword in calculation_keywords
    )

    requires_rag = any(
        keyword in lowered
        for keyword in knowledge_keywords
    )

    steps = []

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