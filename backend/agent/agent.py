from typing import Any

from backend.agent.executor import execute_step
from backend.agent.planner import create_plan


def run_agent(query: str) -> dict[str, Any]:
    plan = create_plan(query)

    execution_results = []

    for step in plan["steps"]:
        result = execute_step(step)
        execution_results.append(result)

    return {
        "query": query,
        "task": plan["task"],
        "plan": plan["steps"],
        "results": execution_results,
    }