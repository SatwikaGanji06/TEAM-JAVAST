from backend.tools.document_reader import read_document


def test_read_txt(tmp_path):
    file = tmp_path / "inspection.txt"
    file.write_text(
        "Pump temperature: 102 C",
        encoding="utf-8"
    )

    result = read_document(str(file))

    assert "Pump temperature: 102 C" in result


def test_missing_file():
    try:
        read_document("does_not_exist.txt")
        assert False
    except FileNotFoundError:
        assert True


def test_unsupported_file(tmp_path):
    file = tmp_path / "test.xyz"
    file.write_text("test", encoding="utf-8")

    try:
        read_document(str(file))
        assert False
    except ValueError:
        assert True
