from backend.agent.planner import create_plan
from backend.agent.executor import execute_step


def test_simple_calculation_plan_extracts_expression():
    plan = create_plan("Calculate 100 / 15")

    assert plan["task"] == "tool_analysis"
    assert len(plan["steps"]) == 1
    assert plan["steps"][0]["action"] == "calculator"
    assert plan["steps"][0]["expression"] == "100 / 15"


def test_simple_calculation_executes():
    plan = create_plan("Calculate 100 / 15")
    result = execute_step(plan["steps"][0])

    assert result["success"] is True
    assert result["result"]["expression"] == "100 / 15"
    assert abs(result["result"]["value"] - (100 / 15)) < 1e-9


def test_simple_subtraction_executes():
    plan = create_plan("Calculate 18.4 - 16.0")
    result = execute_step(plan["steps"][0])

    assert result["success"] is True
    assert result["result"]["expression"] == "18.4 - 16.0"
    assert abs(result["result"]["value"] - 2.4) < 1e-9


def test_industrial_workflow_keeps_reader_rag_calculator():
    plan = create_plan(
        "Analyze this inspection report, compare it with our SOP, "
        "calculate the abnormal readings, and prepare an approval note."
    )

    actions = [step["action"] for step in plan["steps"]]

    assert actions == [
        "document_reader",
        "rag_search",
        "calculator",
    ]
    assert plan["steps"][-1]["mode"] == "deviation_analysis"
