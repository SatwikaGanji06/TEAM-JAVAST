from typing import Any


def verify_consistency(
    results: list[dict[str, Any]] | None,
) -> dict[str, Any]:
    """
    Perform basic consistency checks across tool results.

    A result is considered consistent when:
    - at least one result exists,
    - every result reports success,
    - successful results contain a usable result payload.
    """

    if not results:
        return {
            "name": "consistency",
            "passed": False,
            "message": "No tool results were produced.",
        }

    failed_tools = []
    empty_results = []

    for item in results:
        if not isinstance(item, dict):
            failed_tools.append("unknown")
            continue

        action = item.get("action", "unknown")

        if item.get("success") is not True:
            failed_tools.append(action)
            continue

        result = item.get("result")

        if result is None or result == "" or result == {}:
            empty_results.append(action)

    passed = not failed_tools and not empty_results

    return {
        "name": "consistency",
        "passed": passed,
        "failed_tools": failed_tools,
        "empty_results": empty_results,
        "message": (
            "Tool results are consistent."
            if passed
            else "Tool results contain failures or missing output."
        ),
    }
