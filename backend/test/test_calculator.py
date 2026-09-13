from backend.tools.calculator import calculate


def test_addition():
    assert calculate("102 - 95") == 7


def test_percentage_deviation():
    result = calculate("(102 - 95) / 95 * 100")
    assert round(result, 2) == 7.37


def test_rejects_invalid_expression():
    try:
        calculate("import os")
        assert False
    except ValueError:
        assert True


def test_rejects_empty_expression():
    try:
        calculate("")
        assert False
    except ValueError:
        assert True
