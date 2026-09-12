from datetime import datetime, timezone
from pathlib import Path
import json


AUDIT_LOG_FILE = Path("backend/security/audit.log")


def log_event(
    user_id=None,
    action=None,
    model=None,
    resource=None,
    success=True,
    external_call=False,
    details=None
):
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "action": action,
        "model": model,
        "resource": resource,
        "success": success,
        "external_call": external_call,
        "details": details
    }

    AUDIT_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")

# temporary test
if __name__ == "__main__":
    log_event(
        user_id="test_user",
        action="MODEL_SELECTED",
        model="qwen3:4b",
        resource="chat",
        success=True,
        external_call=False,
        details="Local model selected"
    )

    print("Audit event written successfully.")