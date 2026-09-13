from typing import Any


def verification_result(
    status: str,
    checks: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Build a standardized verification result.

    status should be either:
    - verified
    - needs_review
    """

    if status not in {"verified", "needs_review"}:
        raise ValueError("Invalid verification status.")

    return {
        "status": status,
        "checks": checks,
    }


def all_checks_passed(checks: list[dict[str, Any]]) -> bool:
    """
    Return True only when every verification check passed.
    """

    if not checks:
        return False

    return all(
        check.get("passed") is True
        for check in checks
    )
