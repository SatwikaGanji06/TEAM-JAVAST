from typing import Any

from backend.tools.calculator import calculate


def verify_calculation(
    expression: str,
    reported_result: float | int,
    tolerance: float = 1e-9,
) -> dict[str, Any]:
    """
    Independently verify a reported calculation result.

    The expression is recalculated using the deterministic
    calculator and compared with the reported result.
    """

    if not expression or not expression.strip():
        raise ValueError("Expression is required.")

    expected_result = calculate(expression)

    difference = abs(
        float(expected_result) - float(reported_result)
    )

    passed = difference <= tolerance

    return {
        "name": "calculation",
        "passed": passed,
        "expression": expression,
        "reported_result": reported_result,
        "expected_result": expected_result,
        "difference": difference,
        "message": (
            "Calculation verified."
            if passed
            else "Calculation result does not match."
        ),
    }
