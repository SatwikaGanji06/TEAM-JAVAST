from backend.agent.agent import run_agent


def test_agent_executes_multiple_tools(monkeypatch):
    calls = []

    def fake_execute_step(step, **kwargs):
        calls.append(step["action"])

        return {
            "action": step["action"],
            "success": True,
            "result": {
                "test": True
            },
        }

    monkeypatch.setattr(
        "backend.agent.agent.execute_step",
        fake_execute_step,
    )

    result = run_agent(
        "Read this inspection document, compare with the SOP, "
        "and calculate the deviation."
    )

    assert result["task"] == "tool_analysis"

    actions = [step["action"] for step in result["plan"]]

    assert actions == [
        "document_reader",
        "rag_search",
        "calculator",
    ]

    assert calls == [
        "document_reader",
        "rag_search",
        "calculator",
    ]

    assert len(result["results"]) == 3

    assert all(
        item["success"] is True
        for item in result["results"]
    )
