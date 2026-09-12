from backend.verification.consistency import verify_consistency


def test_consistent_results():
    results = [
        {
            "action": "calculator",
            "success": True,
            "result": {"value": 7},
        },
        {
            "action": "rag_search",
            "success": True,
            "result": {"answer": "SOP limit is 95 C."},
        },
    ]

    result = verify_consistency(results)

    assert result["name"] == "consistency"
    assert result["passed"] is True
    assert result["failed_tools"] == []
    assert result["empty_results"] == []


def test_failed_tool():
    results = [
        {
            "action": "calculator",
            "success": False,
            "result": None,
        },
    ]

    result = verify_consistency(results)

    assert result["passed"] is False
    assert "calculator" in result["failed_tools"]


def test_empty_tool_result():
    results = [
        {
            "action": "rag_search",
            "success": True,
            "result": {},
        },
    ]

    result = verify_consistency(results)

    assert result["passed"] is False
    assert "rag_search" in result["empty_results"]


def test_no_results():
    result = verify_consistency([])

    assert result["passed"] is False


def test_none_results():
    result = verify_consistency(None)

    assert result["passed"] is False


def test_non_dict_result_is_invalid():
    results = [
        "invalid result",
    ]

    result = verify_consistency(results)

    assert result["passed"] is False
