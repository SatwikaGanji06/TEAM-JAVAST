from backend.verification.agent_verifier import verify_agent_results


def test_calculation_result_is_verified():
    results = [
        {
            "action": "calculator",
            "success": True,
            "result": {
                "expression": "102 - 95",
                "value": 7,
            },
        }
    ]

    result = verify_agent_results(results)

    assert result["status"] == "verified"

    names = [check["name"] for check in result["checks"]]

    assert "consistency" in names
    assert "calculation" in names


def test_rag_evidence_is_verified():
    results = [
        {
            "action": "rag_search",
            "success": True,
            "result": {
                "answer": "The SOP limit is 95 C.",
                "sources": [
                    {
                        "content": "Maximum pump temperature is 95 C."
                    }
                ],
            },
        }
    ]

    result = verify_agent_results(results)

    assert result["status"] == "verified"

    names = [check["name"] for check in result["checks"]]

    assert "consistency" in names
    assert "evidence" in names


def test_missing_rag_evidence_needs_review():
    results = [
        {
            "action": "rag_search",
            "success": True,
            "result": {
                "answer": "The SOP limit is 95 C.",
                "sources": [],
            },
        }
    ]

    result = verify_agent_results(results)

    assert result["status"] == "needs_review"


def test_wrong_calculation_needs_review():
    results = [
        {
            "action": "calculator",
            "success": True,
            "result": {
                "expression": "102 - 95",
                "value": 8,
            },
        }
    ]

    result = verify_agent_results(results)

    assert result["status"] == "needs_review"


def test_failed_tool_needs_review():
    results = [
        {
            "action": "calculator",
            "success": False,
            "result": None,
        }
    ]

    result = verify_agent_results(results)

    assert result["status"] == "needs_review"
from backend.agent.agent import run_agent


def test_run_agent_includes_verification(monkeypatch):
    def fake_execute_step(step):
        return {
            "action": step["action"],
            "success": True,
            "result": {
                "answer": "Test response"
            },
        }

    monkeypatch.setattr(
        "backend.agent.agent.execute_step",
        fake_execute_step,
    )

    result = run_agent("Hello")

    assert "verification" in result
    assert result["verification"]["status"] == "verified"
    assert result["verification"]["checks"]
