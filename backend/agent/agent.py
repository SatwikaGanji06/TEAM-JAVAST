from typing import Any

from backend.agent.executor import execute_step
from backend.agent.planner import create_plan
from backend.verification.agent_verifier import verify_agent_results
from backend.security.audit import log_event


def run_agent(query: str, document_ids: list[int] | None = None) -> dict[str, Any]:
    plan = create_plan(query)

    log_event(
        user_id=1,
        action="AGENT_PLAN",
        model="qwen3:4b",
        resource=plan.get("task", "agent"),
        success=True,
        external_call=False,
        details=f"Agent created {len(plan['steps'])} execution step(s)",
    )

    execution_results = []

    for step in plan["steps"]:
        try:
            result = execute_step(step, document_ids=document_ids, execution_results=execution_results)
            execution_results.append(result)

            log_event(
                user_id=1,
                action=step.get("action", "AGENT_STEP").upper(),
                model="qwen3:4b",
                resource=plan.get("task", "agent"),
                success=True,
                external_call=False,
                details=step.get("description", "Agent step completed"),
            )

        except Exception as e:
            log_event(
                user_id=1,
                action="AGENT_STEP_FAILED",
                model="qwen3:4b",
                resource=plan.get("task", "agent"),
                success=False,
                external_call=False,
                details=str(e),
            )
            raise


    verification = verify_agent_results(execution_results)

    log_event(
        user_id=1,
        action="VERIFICATION",
        model="qwen3:4b",
        resource="agent",
        success=verification.get("status") == "verified",
        external_call=False,
        details=f"Verification status: {verification.get('status')}",
    )

    return {
        "query": query,
        "task": plan["task"],
        "plan": plan["steps"],
        "results": execution_results,
        "verification": verification,
    }
