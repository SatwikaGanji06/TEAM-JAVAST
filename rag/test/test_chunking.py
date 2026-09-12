import pytest

from rag.ingestion.chunker import chunk_text


def test_empty_text_returns_no_chunks():
    chunks = chunk_text("")

    assert chunks == []


def test_short_text_returns_one_chunk():
    text = " ".join(f"word{i}" for i in range(100))

    chunks = chunk_text(text)

    assert len(chunks) == 1
    assert chunks[0]["metadata"]["chunk_index"] == 0


def test_long_text_creates_multiple_chunks():
    text = " ".join(f"word{i}" for i in range(1200))

    chunks = chunk_text(text)

    assert len(chunks) > 1


def test_chunk_size_is_respected():
    text = " ".join(f"word{i}" for i in range(1200))

    chunks = chunk_text(
        text,
        chunk_size=500,
        chunk_overlap=50,
    )

    for chunk in chunks:
        word_count = len(chunk["text"].split())
        assert word_count <= 500


def test_overlap_is_preserved():
    text = " ".join(f"word{i}" for i in range(600))

    chunks = chunk_text(
        text,
        chunk_size=500,
        chunk_overlap=50,
    )

    first_words = chunks[0]["text"].split()
    second_words = chunks[1]["text"].split()

    assert first_words[-50:] == second_words[:50]


def test_content_is_preserved():
    text = " ".join(f"word{i}" for i in range(600))

    chunks = chunk_text(
        text,
        chunk_size=500,
        chunk_overlap=50,
    )

    assert "word0" in chunks[0]["text"]
    assert "word599" in chunks[-1]["text"]


def test_invalid_chunk_size():
    with pytest.raises(ValueError):
        chunk_text("some text", chunk_size=0)


def test_invalid_overlap():
    with pytest.raises(ValueError):
        chunk_text(
            "some text",
            chunk_size=100,
            chunk_overlap=100,
        )
