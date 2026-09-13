from backend.verification.calculation import verify_calculation


def test_correct_calculation_is_verified():
    result = verify_calculation(
        "102 - 95",
        7,
    )

    assert result["name"] == "calculation"
    assert result["passed"] is True
    assert result["expected_result"] == 7
    assert result["difference"] == 0


def test_incorrect_calculation_needs_review():
    result = verify_calculation(
        "102 - 95",
        8,
    )

    assert result["passed"] is False
    assert result["expected_result"] == 7
    assert result["reported_result"] == 8


def test_percentage_deviation_is_verified():
    result = verify_calculation(
        "(102 - 95) / 95 * 100",
        7.368421052631579,
    )

    assert result["passed"] is True


def test_small_floating_point_difference_is_allowed():
    result = verify_calculation(
        "0.1 + 0.2",
        0.30000000000000004,
    )

    assert result["passed"] is True


def test_empty_expression_rejected():
    try:
        verify_calculation("", 10)
        assert False
    except ValueError:
        assert True
