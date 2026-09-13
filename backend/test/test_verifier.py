from backend.verification.verifier import (
    all_checks_passed,
    verification_result,
)


def test_verification_result_verified():
    checks = [
        {
            "name": "calculation",
            "passed": True,
        },
        {
            "name": "evidence",
            "passed": True,
        },
    ]

    result = verification_result(
        "verified",
        checks,
    )

    assert result["status"] == "verified"
    assert len(result["checks"]) == 2


def test_verification_result_needs_review():
    checks = [
        {
            "name": "calculation",
            "passed": False,
        },
    ]

    result = verification_result(
        "needs_review",
        checks,
    )

    assert result["status"] == "needs_review"


def test_all_checks_passed():
    checks = [
        {"name": "calculation", "passed": True},
        {"name": "evidence", "passed": True},
    ]

    assert all_checks_passed(checks) is True


def test_all_checks_not_passed():
    checks = [
        {"name": "calculation", "passed": True},
        {"name": "evidence", "passed": False},
    ]

    assert all_checks_passed(checks) is False


def test_empty_checks_fail():
    assert all_checks_passed([]) is False


def test_invalid_status_rejected():
    try:
        verification_result("unknown", [])
        assert False
    except ValueError:
        assert True
