from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.router import api_router


app = FastAPI()
app.include_router(api_router)

client = TestClient(app)


def test_approval_note_endpoint_returns_docx(monkeypatch, tmp_path):
    def fake_run_agent(message, document_ids=None):
        return {
            "query": message,
            "task": "tool_analysis",
            "results": [
                {
                    "action": "rag_search",
                    "success": True,
                    "result": {
                        "answer": "Pump temperature is above the limit.",
                        "sources": [
                            {
                                "content": "Maximum pump temperature is 95 C."
                            }
                        ],
                    },
                }
            ],
            "verification": {
                "status": "verified",
                "checks": [
                    {
                        "name": "evidence",
                        "passed": True,
                    },
                    {
                        "name": "consistency",
                        "passed": True,
                    },
                ],
            },
        }

    monkeypatch.setattr(
        "backend.router.run_agent",
        fake_run_agent,
    )

    generated_dir = Path("backend") / "generated"
    generated_dir.mkdir(parents=True, exist_ok=True)

    response = client.post(
        "/api/approval-note",
        json={
            "message": "Analyze the pump inspection report."
        },
    )

    assert response.status_code == 200
    assert (
        response.headers["content-type"]
        == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert len(response.content) > 0

    generated_files = list(generated_dir.glob("LOKAI_Approval_Note_*.docx"))

    assert generated_files

    for generated_file in generated_files:
        generated_file.unlink(missing_ok=True)
