from typing import List, Dict, Any, Optional
from .connection import get_connection
from psycopg.types.json import Jsonb

class DatabaseRepository:
    """
    Data access layer for the AI Workbench.
    """

    # --- User & Role Management ---

    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT u.*, r.role_name
                    FROM users u
                    JOIN roles r ON u.role_id = r.role_id
                    WHERE u.user_id = %s
                    """,
                    (user_id,)
                )
                row = cur.fetchone()
                if row:
                    # Basic mapping of row to dict
                    cols = [desc[0] for desc in cur.description]
                    return dict(zip(cols, row))
                return None

    def get_all_users(self) -> List[Dict[str, Any]]:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM users")
                cols = [desc[0] for desc in cur.description]
                return [dict(zip(cols, row)) for row in cur.fetchall()]

    def get_role_by_id(self, role_id: int) -> Optional[Dict[str, Any]]:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM roles WHERE role_id = %s", (role_id,))
                row = cur.fetchone()
                if row:
                    cols = [desc[0] for desc in cur.description]
                    return dict(zip(cols, row))
                return None

    # --- Conversation & Message Management ---

    def create_conversation(self, user_id: int, title: Optional[str] = None) -> int:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO conversations (user_id, title) VALUES (%s, %s) RETURNING conversation_id",
                    (user_id, title)
                )
                return cur.fetchone()[0]

    def add_message(self, conversation_id: int, sender: str, text: str) -> int:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO messages (conversation_id, sender, message_text) VALUES (%s, %s, %s) RETURNING message_id",
                    (conversation_id, sender, text)
                )
                return cur.fetchone()[0]

    def get_conversation_history(self, conversation_id: int) -> List[Dict[str, Any]]:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT sender, message_text, created_at FROM messages WHERE conversation_id = %s ORDER BY created_at ASC",
                    (conversation_id,)
                )
                cols = [desc[0] for desc in cur.description]
                return [dict(zip(cols, row)) for row in cur.fetchall()]

    # --- Audit Log Management ---

    def log_audit_event(
        self,
        user_id: Optional[int] = None,
        action: str = None,
        entity_type: str = "SYSTEM",
        entity_id: Optional[int] = None,
        details: str = None,
        ip_address: str = None,
        model: Optional[str] = None,
        success: bool = True,
        external_call: bool = False
    ):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO audit_logs
                    (user_id, action, entity_type, entity_id, details, ip_address, model, success, external_call)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (user_id, action, entity_type, entity_id, details, ip_address, model, success, external_call)
                )

    def get_audit_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT %s", (limit,))
                cols = [desc[0] for desc in cur.description]
                return [dict(zip(cols, row)) for row in cur.fetchall()]
