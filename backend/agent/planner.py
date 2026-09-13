import re
from typing import Any


# ============================================================
# KEYWORDS
# ============================================================

CALCULATION_KEYWORDS = {
    "calculate",
    "calculation",
    "compute",
    "percentage",
    "percent",
    "deviation",
    "difference",
    "ratio",
    "average",
    "sum",
    "subtract",
    "multiply",
    "divide",
}

KNOWLEDGE_KEYWORDS = {
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
    "according to",
    "uploaded document",
    "uploaded file",
    "uploaded report",
    "summarize",
    "summary",
    "analyze",
    "analysis",
    "compare",
    "compare with",
    "compare against",
    "reference",
    "standard",
}


# ============================================================
# REGEX DETECTION
# ============================================================

def _is_arithmetic_expression(query: str) -> bool:
    """
    Detect direct arithmetic expressions.

    Examples:
        100/15
        25 + 30
        50-20
        12 * 8
        100 / 15 + 2
    """

    return bool(
        re.fullmatch(
            r"\s*"
            r"\d+(?:\.\d+)?"
            r"(?:\s*[+\-*/]\s*\d+(?:\.\d+)?)+"
            r"\s*",
            query,
        )
    )


def _is_percentage_expression(query: str) -> bool:
    """
    Detect percentage calculations.

    Examples:
        15% of 800
        20 percent of 500
        12.5 percentage of 400
    """

    return bool(
        re.search(
            r"\d+(?:\.\d+)?\s*"
            r"(?:%|percent|percentage)\s+of\s+"
            r"\d+(?:\.\d+)?",
            query,
            re.IGNORECASE,
        )
    )


# ============================================================
# PLANNER
# ============================================================

def create_plan(query: str) -> dict[str, Any]:
    """
    Create a deterministic execution plan.

    The planner decides whether the request requires:

        - calculator
        - RAG
        - general Qwen response

    The frontend does NOT decide this.
    """

    query = (query or "").strip()
    query_lower = query.lower()

    # --------------------------------------------------------
    # Detect calculation
    # --------------------------------------------------------

    requires_calculation = (
        any(
            keyword in query_lower
            for keyword in CALCULATION_KEYWORDS
        )
        or _is_arithmetic_expression(query)
        or _is_percentage_expression(query)
    )

    # --------------------------------------------------------
    # Detect knowledge / RAG requirement
    # --------------------------------------------------------

    requires_rag = any(
        keyword in query_lower
        for keyword in KNOWLEDGE_KEYWORDS
    )

    steps = []

    # ========================================================
    # RAG
    # ========================================================

    if requires_rag:
        steps.append(
            {
                "step": len(steps) + 1,
                "action": "rag_search",
                "description": (
                    "Search indexed documents and reference "
                    "resources for relevant evidence."
                ),
                "query": query,
            }
        )

    # ========================================================
    # CALCULATOR
    # ========================================================

    if requires_calculation:
        steps.append(
            {
                "step": len(steps) + 1,
                "action": "calculator",
                "description": (
                    "Perform the requested calculation "
                    "using the deterministic calculator."
                ),
                "query": query,
            }
        )

    # ========================================================
    # TOOL ANALYSIS
    # ========================================================

    if requires_rag or requires_calculation:
        return {
            "task": "tool_analysis",
            "steps": steps,
        }

    # ========================================================
    # GENERAL CHAT
    # ========================================================

    steps.append(
        {
            "step": 1,
            "action": "llm_response",
            "description": (
                "Generate a response using the local "
                "language model."
            ),
            "query": query,
        }
    )

    return {
        "task": "general_chat",
        "steps": steps,
    }