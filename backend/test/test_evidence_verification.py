from backend.verification.evidence import verify_evidence


def test_evidence_present():
    sources = [
        {
            "content": "SOP limit for pump temperature is 95 C."
        }
    ]

    result = verify_evidence(sources)

    assert result["name"] == "evidence"
    assert result["passed"] is True
    assert result["source_count"] == 1


def test_multiple_evidence_sources():
    sources = [
        {"content": "Pump temperature limit: 95 C."},
        {"content": "Inspection reading: 102 C."},
    ]

    result = verify_evidence(sources)

    assert result["passed"] is True
    assert result["source_count"] == 2


def test_no_evidence():
    result = verify_evidence([])

    assert result["passed"] is False
    assert result["source_count"] == 0


def test_none_evidence():
    result = verify_evidence(None)

    assert result["passed"] is False
    assert result["source_count"] == 0


def test_empty_source_content():
    sources = [
        {"content": ""},
        {"content": "   "},
    ]

    result = verify_evidence(sources)

    assert result["passed"] is False
    assert result["source_count"] == 0


def test_string_source():
    sources = [
        "SOP states maximum temperature is 95 C."
    ]

    result = verify_evidence(sources)

    assert result["passed"] is True
    assert result["source_count"] == 1
