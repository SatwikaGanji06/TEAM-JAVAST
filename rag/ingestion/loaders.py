from pathlib import Path
from pypdf import PdfReader


def load_text_file(file_path: str | Path) -> str:
    """
    Load a UTF-8 text file and return its contents.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    if not path.is_file():
        raise ValueError(f"Path is not a file: {path}")

    if path.suffix.lower() != ".txt":
        raise ValueError(f"Unsupported file type: {path.suffix}")

    return path.read_text(encoding="utf-8")


def load_pdf(file_path: str | Path) -> list[dict]:
    """
    Load a PDF and return page-level text with metadata.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    if not path.is_file():
        raise ValueError(f"Path is not a file: {path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Unsupported file type: {path.suffix}")

    try:
        reader = PdfReader(str(path))
    except Exception as exc:
        raise ValueError(f"Unable to read PDF: {path}") from exc

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""

        pages.append(
            {
                "text": text,
                "metadata": {
                    "page": page_number,
                },
            }
        )

    return pages
