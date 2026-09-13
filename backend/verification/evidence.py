from typing import Any


def verify_evidence(
    sources: list[Any] | None,
) -> dict[str, Any]:
    """
    Verify that a RAG result contains supporting evidence.

    Evidence is considered present when at least one source
    contains meaningful retrieved content.
    """

    if not sources:
        return {
            "name": "evidence",
            "passed": False,
            "source_count": 0,
            "message": "No supporting evidence was retrieved.",
        }

    valid_sources = []

    for source in sources:
        if isinstance(source, dict):
            content = (
                source.get("content")
                or source.get("text")
                or source.get("chunk")
                or ""
            )

            if isinstance(content, str) and content.strip():
                valid_sources.append(source)

        elif isinstance(source, str) and source.strip():
            valid_sources.append(source)

    passed = len(valid_sources) > 0

    return {
        "name": "evidence",
        "passed": passed,
        "source_count": len(valid_sources),
        "message": (
            "Supporting evidence retrieved."
            if passed
            else "Retrieved sources contain no usable evidence."
        ),
    }
