import re
from typing import Any

from backend.agent.executor import execute_step
from backend.agent.planner import create_plan
from backend.models.qwen import ask_qwen
from backend.verification.agent_verifier import verify_agent_results


# ============================================================
# RESPONSE CLEANING
# ============================================================

def _clean_response(text: str) -> str:
    """
    Clean Qwen's response before sending it to the frontend.

    Removes unwanted Markdown / LaTeX formatting while
    preserving the actual content.
    """

    if not text:
        return ""

    text = str(text)

    # --------------------------------------------------------
    # Remove Markdown bold / italic
    # --------------------------------------------------------

    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text, flags=re.DOTALL)
    text = re.sub(r"__(.*?)__", r"\1", text, flags=re.DOTALL)

    # Remove remaining standalone asterisks
    text = text.replace("*", "")

    # --------------------------------------------------------
    # Remove Markdown headings
    # --------------------------------------------------------

    text = re.sub(
        r"^\s*#{1,6}\s*",
        "",
        text,
        flags=re.MULTILINE,
    )

    # --------------------------------------------------------
    # Remove backticks
    # --------------------------------------------------------

    text = text.replace("```", "")
    text = text.replace("`", "")

    # --------------------------------------------------------
    # Remove LaTeX delimiters
    # --------------------------------------------------------

    text = text.replace("\\(", "")
    text = text.replace("\\)", "")
    text = text.replace("\\[", "")
    text = text.replace("\\]", "")

    # --------------------------------------------------------
    # Convert common LaTeX fractions
    # --------------------------------------------------------

    text = re.sub(
        r"\\frac\{([^{}]+)\}\{([^{}]+)\}",
        r"\1/\2",
        text,
    )

    # --------------------------------------------------------
    # Remove common LaTeX commands
    # --------------------------------------------------------

    text = re.sub(r"\\overline\{([^{}]+)\}", r"\1...", text)
    text = text.replace("\\times", "×")
    text = text.replace("\\div", "÷")
    text = text.replace("\\cdot", "·")

    # --------------------------------------------------------
    # Clean excessive whitespace
    # --------------------------------------------------------

    text = re.sub(r"[ \t]+", " ", text)

    # Keep paragraph structure but remove excessive blank lines
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)

    return text.strip()


# ============================================================
# SYNTHESIS PROMPT
# ============================================================

def _build_synthesis_prompt(
    query: str,
    execution_results: list[dict[str, Any]],
) -> list[dict[str, str]]:
    """
    Build the final Qwen3:4B prompt from tool results.

    Used for requests that need RAG or multiple tools.
    """

    evidence_parts = []

    for item in execution_results:

        if not isinstance(item, dict):
            continue

        action = item.get("action")
        result = item.get("result")

        if not isinstance(result, dict):
            continue

        # ----------------------------------------------------
        # RAG RESULT
        # ----------------------------------------------------

        if action == "rag_search":

            answer = result.get("answer", "")
            sources = result.get("sources", [])

            if answer:
                evidence_parts.append(
                    f"RAG result:\n{answer}"
                )

            if isinstance(sources, list):

                for source in sources:

                    if not isinstance(source, dict):
                        continue

                    content = source.get("content", "")
                    document = (
                        source.get("document")
                        or "Indexed document"
                    )
                    chunk_index = source.get("chunk_index")

                    if content:
                        evidence_parts.append(
                            f"Source: {document}, "
                            f"chunk {chunk_index}\n"
                            f"{content}"
                        )

        # ----------------------------------------------------
        # CALCULATOR RESULT
        # ----------------------------------------------------

        elif action == "calculator":

            evidence_parts.append(
                "Calculator result:\n"
                f"Expression: "
                f"{result.get('expression', '')}\n"
                f"Value: {result.get('value', '')}"
            )

        # ----------------------------------------------------
        # DOCUMENT READER RESULT
        # ----------------------------------------------------

        elif action == "document_reader":

            text = result.get("text", "")

            if text:
                evidence_parts.append(
                    f"Document content:\n{text}"
                )

    evidence = "\n\n".join(evidence_parts)

    system_prompt = (
        "You are the final response model for an "
        "industrial AI workbench. "

        "Answer the user's request using the evidence "
        "provided by the tools. "

        "Do not invent facts. "

        "If document evidence is provided, ground the "
        "answer in it. "

        "If a calculation result is provided, use that "
        "result exactly. "

        "Answer naturally, clearly, and concisely. "

        "IMPORTANT FORMATTING RULES: "
        "Use plain text only. "
        "Do not use Markdown. "
        "Do not use asterisks. "
        "Do not use double asterisks. "
        "Do not use hashtags for headings. "
        "Do not use backticks. "
        "Do not use LaTeX. "
        "Do not use LaTeX commands. "
        "Do not use tables unless explicitly requested. "

        "Use simple plain-text paragraphs and numbered lists "
        "when appropriate. "

        "Do not mention internal routing, agents, tools, "
        "or prompts unless the user explicitly asks "
        "about them."
    )

    user_prompt = (
        f"User request:\n{query}\n\n"
        f"Tool evidence:\n"
        f"{evidence or 'No additional tool evidence.'}\n\n"
        "Produce the final answer for the user."
    )

    return [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": user_prompt,
        },
    ]


# ============================================================
# NUMBER FORMATTING
# ============================================================

def _format_number(value: Any) -> str:
    """
    Convert a calculator result into clean plain text.

    Examples:
        120.0       -> 120
        6.666666666 -> 6.666666666
        100.500000  -> 100.5
    """

    if isinstance(value, bool):
        return str(value)

    if isinstance(value, int):
        return str(value)

    if isinstance(value, float):

        if value.is_integer():
            return str(int(value))

        formatted = (
            f"{value:.10f}"
            .rstrip("0")
            .rstrip(".")
        )

        return formatted

    return str(value)


# ============================================================
# SOURCE COLLECTION
# ============================================================

def _collect_sources(
    execution_results: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Collect RAG sources so the final response can expose them.
    """

    sources = []

    for item in execution_results:

        if not isinstance(item, dict):
            continue

        if item.get("action") != "rag_search":
            continue

        result = item.get("result")

        if not isinstance(result, dict):
            continue

        rag_sources = result.get("sources", [])

        if isinstance(rag_sources, list):
            sources.extend(rag_sources)

    return sources


# ============================================================
# AGENT
# ============================================================

def run_agent(query: str) -> dict[str, Any]:
    """
    Run the complete local agent workflow.

    Flow:

        User query
             ↓
        Planner
             ↓
        RAG / Tools / LLM
             ↓
        Final response
             ↓
        Verification

    Calculation-only requests bypass Qwen so that
    numerical results remain deterministic and clean.
    """

    plan = create_plan(query)

    execution_results: list[dict[str, Any]] = []

    # ========================================================
    # EXECUTE PLANNED STEPS
    # ========================================================

    for step in plan["steps"]:

        result = execute_step(step)

        execution_results.append(result)

    # ========================================================
    # IDENTIFY TOOL TYPES
    # ========================================================

    has_calculator = any(
        isinstance(item, dict)
        and item.get("action") == "calculator"
        for item in execution_results
    )

    has_rag = any(
        isinstance(item, dict)
        and item.get("action") == "rag_search"
        for item in execution_results
    )

    has_document_reader = any(
        isinstance(item, dict)
        and item.get("action") == "document_reader"
        for item in execution_results
    )

    # ========================================================
    # CALCULATION-ONLY REQUEST
    # ========================================================

    if (
        plan["task"] == "tool_analysis"
        and has_calculator
        and not has_rag
        and not has_document_reader
    ):

        calculator_item = next(
            (
                item
                for item in execution_results
                if (
                    isinstance(item, dict)
                    and item.get("action") == "calculator"
                )
            ),
            None,
        )

        calculator_result = {}

        if isinstance(calculator_item, dict):

            result = calculator_item.get("result")

            if isinstance(result, dict):
                calculator_result = result

        value = calculator_result.get("value")

        final_answer = _format_number(value)

        execution_results.append(
            {
                "action": "llm_response",
                "success": True,
                "result": {
                    "answer": final_answer,
                    "sources": [],
                },
            }
        )

    # ========================================================
    # RAG / MULTI-TOOL REQUEST
    # ========================================================

    elif plan["task"] == "tool_analysis":

        synthesis_messages = _build_synthesis_prompt(
            query,
            execution_results,
        )

        raw_answer = ask_qwen(
            synthesis_messages
        )

        # Clean Qwen output before returning it
        final_answer = _clean_response(raw_answer)

        execution_results.append(
            {
                "action": "llm_response",
                "success": True,
                "result": {
                    "answer": final_answer,
                    "sources": _collect_sources(
                        execution_results
                    ),
                },
            }
        )

    # ========================================================
    # GENERAL CHAT
    # ========================================================

    else:

        # Planner created an llm_response step and
        # execute_step() already called Qwen3:4B.

        for item in execution_results:

            if (
                isinstance(item, dict)
                and item.get("action") == "llm_response"
            ):

                result = item.get("result")

                if isinstance(result, dict):

                    raw_answer = result.get(
                        "answer",
                        "",
                    )

                    cleaned_answer = _clean_response(
                        raw_answer
                    )

                    result["answer"] = cleaned_answer

                    break

    # ========================================================
    # VERIFICATION
    # ========================================================

    verification = verify_agent_results(
        execution_results
    )

    # ========================================================
    # FINAL AGENT RESULT
    # ========================================================

    return {
        "query": query,
        "task": plan["task"],
        "plan": plan["steps"],
        "results": execution_results,
        "verification": verification,
    }