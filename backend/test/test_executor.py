from backend.agent.executor import execute_step


def test_executor_calculator():
    result = execute_step({
        "step": 1,
        "action": "calculator",
        "query": "102 - 95",
    })

    assert result["success"] is True
    assert result["action"] == "calculator"
    assert result["result"]["value"] == 7


def test_executor_document_reader(tmp_path):
    file = tmp_path / "inspection.txt"

    file.write_text(
        "Pump temperature: 102 C",
        encoding="utf-8",
    )

    result = execute_step({
        "step": 1,
        "action": "document_reader",
        "file_path": str(file),
        "query": "Read inspection document",
    })

    assert result["success"] is True
    assert result["action"] == "document_reader"
    assert "Pump temperature: 102 C" in result["result"]["text"]


def test_executor_rejects_missing_document_path():
    try:
        execute_step({
            "step": 1,
            "action": "document_reader",
            "query": "Read inspection document",
        })
        assert False
    except ValueError:
        assert True


def test_executor_rejects_unknown_tool():
    try:
        execute_step({
            "step": 1,
            "action": "unknown_tool",
            "query": "test",
        })
        assert False
    except ValueError:
        assert True
