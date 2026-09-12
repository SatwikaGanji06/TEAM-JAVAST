import pytest
from rag.retrieval import retrieve

# Positive Test Cases
POSITIVE_CASES = [
    {
        "query": "What PPE is required in restricted refinery areas?",
        "expected_source": "refinery_safety.txt",
        "keywords": ["safety helmet", "protective gloves", "safety shoes", "eye protection"]
    },
    {
        "query": "How often are centrifugal pumps inspected?",
        "expected_source": "equipment_maintenance.txt",
        "keywords": ["every six months"]
    },
    {
        "query": "What should workers do if there is a gas leak?",
        "expected_source": "emergency_operations.txt",
        "keywords": ["move away", "notify the control room"]
    },
    {
        "query": "How should fire emergencies be handled?",
        "expected_source": "emergency_operations.txt",
        "keywords": ["activate the fire alarm", "designated assembly point", "emergency response personnel"]
    },
    {
        "query": "What information must be included in maintenance records?",
        "expected_source": "equipment_maintenance.txt",
        "keywords": ["identification number", "date", "technician name", "observed condition"]
    },
]

# Negative Test Case
NEGATIVE_CASE = {
    "query": "What is the employee annual leave policy?",
    "expected_source": None # Should not match any demo doc strongly
}

@pytest.mark.parametrize("case", POSITIVE_CASES)
def test_retrieval_positive_cases(case):
    """Verify that known queries retrieve the correct document and relevant content."""
    results = retrieve(case["query"], top_k=1)
    assert len(results) > 0, f"No results returned for query: {case['query']}"

    top_result = results[0]
    assert top_result["source"] == case["expected_source"], \
        f"Query '{case['query']}' expected {case['expected_source']} but got {top_result['source']}"

    # Check that at least some keywords or concepts are present (semantic check)
    text = top_result["chunk_text"].lower()
    found_any = any(kw.lower() in text for kw in case["keywords"])
    # Note: we use a soft check here because semantic retrieval might use synonyms,
    # but for the demo corpus the wording is fairly close.
    assert found_any, f"Retrieved text for '{case['query']}' does not contain expected concepts: {case['keywords']}. Text: {text}"

def test_retrieval_negative_case():
    """Verify behavior for queries not present in the corpus."""
    results = retrieve(NEGATIVE_CASE["query"], top_k=1)
    # Raw vector search usually returns something. We check that it's not an obvious "hit"
    # relative to positive cases.
    if results:
        top_result = results[0]
        # We don't assert empty because we haven't implemented a threshold yet.
        # Just verify it exists and we can record the score.
        assert "chunk_text" in top_result
        assert "similarity" in top_result

@pytest.mark.parametrize("top_k", [1, 3, 5])
def test_retrieval_top_k(top_k):
    """Verify that top_k is respected and results are ranked by similarity."""
    query = POSITIVE_CASES[0]["query"]
    results = retrieve(query, top_k=top_k)

    assert len(results) <= top_k

    # Verify ranking: similarity[i] >= similarity[i+1]
    for i in range(len(results) - 1):
        assert results[i]["similarity"] >= results[i+1]["similarity"], \
            f"Results not correctly ranked at index {i}"

def test_retrieval_input_validation():
    """Verify that invalid queries are handled safely."""
    # Empty string
    with pytest.raises(ValueError):
        retrieve("", top_k=5)

    # Whitespace only
    with pytest.raises(ValueError):
        retrieve("   ", top_k=5)

    # None
    with pytest.raises(ValueError):
        retrieve(None, top_k=5)

    # Invalid top_k
    with pytest.raises(ValueError):
        retrieve("Valid query", top_k=0)

    with pytest.raises(ValueError):
        retrieve("Valid query", top_k=-1)

def test_retrieval_result_structure():
    """Verify that the result contains all required fields for Phase 5."""
    results = retrieve(POSITIVE_CASES[0]["query"], top_k=1)
    assert len(results) > 0
    res = results[0]

    required_fields = [
        "chunk_id", "document_id", "chunk_index",
        "chunk_text", "similarity", "metadata", "source"
    ]
    for field in required_fields:
        assert field in res, f"Missing required field: {field}"
