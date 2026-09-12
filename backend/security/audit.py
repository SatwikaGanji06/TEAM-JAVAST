from datetime import datetime, timezone
from pathlib import Path
import json
from backend.database.repository import DatabaseRepository

AUDIT_LOG_FILE = Path(__file__).resolve().parent / "audit.log"
db_repo = DatabaseRepository()


def log_event(
    user_id=None,
    action=None,
    model=None,
    resource=None,
    success=True,
    external_call=False,
    details=None
):
    # 1. Persistent Database Logging
    try:
        db_repo.log_audit_event(
            user_id=user_id if isinstance(user_id, int) else None,
            action=action,
            entity_type=resource if resource else "SYSTEM",
            entity_id=None, # Resource as entity_type, ID not provided in current log_event signature
            details=details,
            ip_address="127.0.0.1", # Default for local prototype
            model=model,
            success=success,
            external_call=external_call
        )
    except Exception as e:
        # Fail silently for DB audit to not block main flow, but print to stderr
        print(f"Database audit logging failed: {e}")

    # 2. Local Runtime Logging (Preserved for debugging)
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