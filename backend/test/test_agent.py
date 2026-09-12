from backend.agent.planner import create_plan


def test_planner_detects_knowledge_task():
    plan = create_plan(
        "Analyze the inspection report according to the SOP."
    )

    assert plan["task"] == "tool_analysis"
    assert len(plan["steps"]) == 1
    assert plan["steps"][0]["action"] == "rag_search"


def test_planner_detects_general_chat():
    plan = create_plan("Hello, how are you?")

    assert plan["task"] == "general_chat"
    assert plan["steps"][0]["action"] == "llm_response"


def test_planner_does_not_use_rag_for_generic_explanation():
    plan = create_plan("Hello, explain what you can do.")

    assert plan["task"] == "general_chat"
    assert plan["steps"][0]["action"] == "llm_response"


def test_planner_detects_sop_question():
    plan = create_plan(
        "What does the SOP say about pump inspection?"
    )

    assert plan["task"] == "tool_analysis"
    assert plan["steps"][0]["action"] == "rag_search"


def test_planner_detects_calculation():
    plan = create_plan(
        "Calculate the deviation between 102 and 95."
    )

    assert plan["task"] == "tool_analysis"
    assert plan["steps"][0]["action"] == "calculator"


def test_planner_detects_document_reader():
    plan = create_plan(
        "Read this document and extract the measurements."
    )

    assert plan["task"] == "tool_analysis"
    assert plan["steps"][0]["action"] == "document_reader"


def test_planner_can_combine_document_rag_and_calculation():
    plan = create_plan(
        "Read this inspection document, compare with the SOP, "
        "and calculate the deviation."
    )

    assert plan["task"] == "tool_analysis"

    actions = [step["action"] for step in plan["steps"]]

    assert "document_reader" in actions
    assert "rag_search" in actions
    assert "calculator" in actions


def test_planner_rejects_empty_query():
    try:
        create_plan("")
        assert False
    except ValueError:
        assert True
