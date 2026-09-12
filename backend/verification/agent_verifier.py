from typing import Any

from backend.verification.calculation import verify_calculation
from backend.verification.consistency import verify_consistency
from backend.verification.evidence import verify_evidence
from backend.verification.verifier import all_checks_passed


def verify_agent_results(
    results: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Combine calculation, evidence, and consistency checks
    into one verification result.
    """

    checks = []

    consistency = verify_consistency(results)
    checks.append(consistency)

    for item in results:
        if not isinstance(item, dict):
            continue

        if item.get("action") == "rag_search":
            rag_result = item.get("result") or {}

            sources = []

            if isinstance(rag_result, dict):
                sources = rag_result.get("sources") or []

            checks.append(
                verify_evidence(sources)
            )

        elif item.get("action") == "calculator":
            calculator_result = item.get("result") or {}

            if isinstance(calculator_result, dict):
                expression = calculator_result.get("expression")
                reported_result = calculator_result.get("value")

                if expression is not None and reported_result is not None:
                    checks.append(
                        verify_calculation(
                            expression,
                            reported_result,
                        )
                    )

    status = (
        "verified"
        if all_checks_passed(checks)
        else "needs_review"
    )

    return {
        "status": status,
        "checks": checks,
    }
