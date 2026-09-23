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
    details=None,
):
    # Security/sovereignty metadata
    execution = "EXTERNAL" if external_call else "LOCAL"
    external_api = bool(external_call)
    data_egress = bool(external_call)

    # 1. Persistent database logging
    try:
        db_repo.log_audit_event(
            user_id=user_id if isinstance(user_id, int) else None,
            action=action,
            entity_type=resource if resource else "SYSTEM",
            entity_id=None,
            details=details,
            ip_address="127.0.0.1",
            model=model,
            success=success,
            external_call=external_call,
        )
    except Exception as e:
        print(f"Database audit logging failed: {e}")

    # 2. Local runtime audit log
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "action": action,
        "model": model,
        "resource": resource,
        "success": success,
        "external_call": external_call,
        "execution": execution,
        "external_api": external_api,
        "data_egress": data_egress,
        "details": details,
    }

    AUDIT_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")

def get_audit_events(limit: int = 100) -> list[dict]:
    """Return the most recent local audit events."""

    if not AUDIT_LOG_FILE.exists():
        return []

    events = []

    with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()

            if not line:
                continue

            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    return list(reversed(events[-limit:]))
