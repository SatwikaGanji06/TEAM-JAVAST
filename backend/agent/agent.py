from typing import Any

from backend.agent.executor import execute_step
from backend.agent.planner import create_plan
from backend.models.qwen import ask_qwen
from backend.verification.agent_verifier import verify_agent_results


def _build_synthesis_prompt(
    query: str,
    execution_results: list[dict[str, Any]],
) -> list[dict[str, str]]:
    """
    Build the final Qwen3:4B prompt from tool results.
    """

    evidence_parts = []

    for item in execution_results:
        if not isinstance(item, dict):
            continue

        action = item.get("action")
        result = item.get("result")

        if action == "rag_search" and isinstance(result, dict):
            answer = result.get("answer", "")
            sources = result.get("sources", [])

            if answer:
                evidence_parts.append(
                    f"RAG result:\n{answer}"
                )

            for source in sources:
                if not isinstance(source, dict):
                    continue

                content = source.get("content", "")
                document = source.get("document") or "Indexed document"
                chunk_index = source.get("chunk_index")

                if content:
                    evidence_parts.append(
                        f"Source: {document}, "
                        f"chunk {chunk_index}\n"
                        f"{content}"
                    )

        elif action == "calculator" and isinstance(result, dict):
            evidence_parts.append(
                "Calculator result:\n"
                f"Expression: {result.get('expression', '')}\n"
                f"Value: {result.get('value', '')}"
            )

        elif action == "document_reader" and isinstance(result, dict):
            text = result.get("text", "")

            if text:
                evidence_parts.append(
                    f"Document content:\n{text}"
                )

    evidence = "\n\n".join(evidence_parts)

    system_prompt = (
        "You are the final response model for an industrial AI "
        "workbench. Answer the user's request using the evidence "
        "provided by the tools. Do not invent facts. "
        "If document evidence is provided, ground the answer in it. "
        "If a calculation result is provided, use that result. "
        "Answer naturally and clearly. "
        "Do not mention internal routing, agents, tools, or prompts "
        "unless the user explicitly asks about them."
    )

    user_prompt = (
        f"User request:\n{query}\n\n"
        f"Tool evidence:\n{evidence or 'No additional tool evidence.'}\n\n"
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


def run_agent(query: str) -> dict[str, Any]:
    """
    Run the complete local agent workflow.

    Flow:
        User query
            ↓
        Planner
            ↓
        RAG / Tools
            ↓
        Qwen3:4B final synthesis
            ↓
        Verification
    """

    plan = create_plan(query)

    execution_results = []

    for step in plan["steps"]:
        result = execute_step(step)
        execution_results.append(result)

    # --------------------------------------------------------
    # TOOL-BASED REQUEST
    # --------------------------------------------------------

    if plan["task"] == "tool_analysis":
        synthesis_messages = _build_synthesis_prompt(
            query,
            execution_results,
        )

        final_answer = ask_qwen(synthesis_messages)

        execution_results.append({
            "action": "llm_response",
            "success": True,
            "result": {
                "answer": final_answer,
                "sources": _collect_sources(execution_results),
            },
        })

    # --------------------------------------------------------
    # GENERAL CHAT
    # --------------------------------------------------------

    verification = verify_agent_results(
        execution_results
    )

    return {
        "query": query,
        "task": plan["task"],
        "plan": plan["steps"],
        "results": execution_results,
        "verification": verification,
    }


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