from typing import Any
import re


def _extract_calculation_expression(question: str) -> str | None:
    """
    Extract a simple arithmetic expression from a natural-language
    calculation request.

    Only returns expressions containing numbers and basic arithmetic
    operators. Returns None for anything that should not be handled as
    a simple deterministic calculation.
    """

    text = question.strip()

    # Remove common calculation-intent prefixes.
    text = re.sub(
        r"^\s*(please\s+)?"
        r"(calculate|compute|calculation|find|evaluate)\s*"
        r"(the\s+)?"
        r"(result|value)?\s*"
        r"(?::|=)?\s*",
        "",
        text,
        flags=re.IGNORECASE,
    ).strip()

    # Only accept a simple arithmetic expression.
    # Numbers may be integers or decimals.
    # Supported operators: + - * / **
    if not re.fullmatch(
        r"[0-9]+(?:\.[0-9]+)?"
        r"(?:\s*(?:\*\*|[+\-*/])\s*"
        r"[0-9]+(?:\.[0-9]+)?)+",
        text,
    ):
        return None

    return text


def create_plan(query: str) -> dict[str, Any]:
    """
    Create a deterministic execution plan.
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
        "documents",
        "report",
        "reports",
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
        "analyse the documents",
        "analyze the documents",
        "analyse these documents",
        "analyze these documents",
        "analyse this document",
        "analyze this document",
        "summarize the documents",
        "summarise the documents",
        "summarize these documents",
        "summarise these documents",
        "key findings",
        "main findings",
        "document findings",
        "document risks",
    ]

    generic_document_analysis_phrases = [
        "analyse the documents",
        "analyze the documents",
        "analyse these documents",
        "analyze these documents",
        "analyse this document",
        "analyze this document",
        "summarize the documents",
        "summarise the documents",
        "summarize these documents",
        "summarise these documents",
        "key findings",
        "main findings",
        "document findings",
        "document risks",
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

    # ---------------------------------------------------------
    # SIMPLE DETERMINISTIC CALCULATION
    # ---------------------------------------------------------
    simple_expression = _extract_calculation_expression(question)

    if simple_expression is not None:
        return {
            "task": "tool_analysis",
            "steps": [
                {
                    "step": 1,
                    "action": "calculator",
                    "description": (
                        "Perform the requested deterministic calculation."
                    ),
                    "query": question,
                    "expression": simple_expression,
                }
            ],
        }

    # ---------------------------------------------------------
    # INDUSTRIAL INSPECTION WORKFLOW
    # ---------------------------------------------------------
    if (
        requires_calculation
        and requires_rag
        and "inspection" in lowered
    ):
        return {
            "task": "industrial_analysis",
            "steps": [
                {
                    "step": 1,
                    "action": "document_reader",
                    "description": (
                        "Read the supplied local inspection document "
                        "and extract its measurements."
                    ),
                    "query": question,
                },
                {
                    "step": 2,
                    "action": "rag_search",
                    "description": (
                        "Search indexed internal documents for SOP "
                        "limits and relevant evidence."
                    ),
                    "query": (
                        "Find the applicable SOP limits, requirements, acceptance "
                        "criteria, and supporting evidence relevant to the "
                        "measurements and findings in the inspection document. "
                        "Return only information supported by the indexed "
                        "documents. Do not perform calculations."
                    ),
                },
                {
                    "step": 3,
                    "action": "calculator",
                    "description": (
                        "Calculate deviations from measured values "
                        "and applicable SOP limits."
                    ),
                    "query": question,
                    "mode": "deviation_analysis",
                },
            ],
        }

    steps = []

    is_generic_document_analysis = any(
        phrase in lowered
        for phrase in generic_document_analysis_phrases
    )

    # ---------------------------------------------------------
    # GENERIC SELECTED-DOCUMENT ANALYSIS
    # ---------------------------------------------------------
    # When the user explicitly asks to analyze/summarize documents,
    # use RAG even when the query itself contains very little
    # semantic information. The selected document IDs, when supplied
    # by the caller, become the retrieval scope.
    if is_generic_document_analysis and not requires_calculation:
        return {
            "task": "document_analysis",
            "steps": [
                {
                    "step": 1,
                    "action": "rag_search",
                    "description": (
                        "Analyze the selected local documents and "
                        "identify their main findings, measurements, "
                        "risks, limits, observations and relevant "
                        "relationships using retrieved evidence."
                    ),
                    "query": (
                        "Analyze the selected documents. "
                        "Summarize the main findings, important "
                        "measurements, risks, limits, observations, "
                        "and relevant relationships between the "
                        "documents. Use only the document evidence."
                    ),
                },
            ],
        }

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

