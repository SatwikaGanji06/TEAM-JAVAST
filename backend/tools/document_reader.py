from pathlib import Path


def read_document(file_path: str) -> str:
    """
    Read text from a local TXT, PDF, or DOCX document.
    """

    if not file_path:
        raise ValueError("File path is required.")

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Document not found: {file_path}")

    suffix = path.suffix.lower()

    if suffix == ".txt":
        return path.read_text(encoding="utf-8")

    if suffix == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        pages = []

        for page in reader.pages:
            text = page.extract_text() or ""
            pages.append(text)

        return "\n".join(pages).strip()

    if suffix == ".docx":
        from docx import Document

        document = Document(str(path))
        paragraphs = [paragraph.text for paragraph in document.paragraphs]

        return "\n".join(paragraphs).strip()

    raise ValueError(
        f"Unsupported document type: {suffix}. "
        "Supported types are .txt, .pdf, and .docx."
    )
