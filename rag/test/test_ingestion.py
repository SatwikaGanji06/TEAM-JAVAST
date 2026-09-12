import pytest

from rag.ingestion.loaders import load_text_file, load_pdf


TEST_FILE = "rag/data/raw/test_manual.txt"


def test_load_text_file():
    text = load_text_file(TEST_FILE)

    assert isinstance(text, str)
    assert len(text) > 0
    assert "reactor temperature" in text


def test_text_content_is_preserved():
    text = load_text_file(TEST_FILE)

    assert "80°C" in text
    assert "emergency shutdown procedure" in text


def test_missing_file_raises_error():
    with pytest.raises(FileNotFoundError):
        load_text_file("rag/data/raw/does_not_exist.txt")


def test_directory_path_raises_error():
    with pytest.raises(ValueError):
        load_text_file("rag/data/raw")


def test_unsupported_file_type_raises_error(tmp_path):
    pdf_file = tmp_path / "test.pdf"
    pdf_file.write_text("dummy content")

    with pytest.raises(ValueError):
        load_text_file(pdf_file)


def test_load_pdf():
    pages = load_pdf("rag/data/raw/test_manual.pdf")

    assert len(pages) == 2


def test_pdf_page_metadata():
    pages = load_pdf("rag/data/raw/test_manual.pdf")

    assert pages[0]["metadata"]["page"] == 1
    assert pages[1]["metadata"]["page"] == 2


def test_pdf_text_is_extracted():
    pages = load_pdf("rag/data/raw/test_manual.pdf")

    assert "Industrial Safety Manual" in pages[0]["text"]
    assert "Emergency Procedures" in pages[1]["text"]


def test_missing_pdf_raises_error():
    with pytest.raises(FileNotFoundError):
        load_pdf("rag/data/raw/does_not_exist.pdf")


def test_invalid_pdf_raises_error(tmp_path):
    invalid_pdf = tmp_path / "invalid.pdf"
    invalid_pdf.write_text("This is not a real PDF.")

    with pytest.raises(ValueError):
        load_pdf(invalid_pdf)
