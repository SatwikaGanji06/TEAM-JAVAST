import unittest
import os
from backend.database.repository import DatabaseRepository
from rag.database.postgres import VectorStore
from backend.database.connection import get_connection

class TestDatabaseIntegration(unittest.TestCase):
    def setUp(self):
        self.repo = DatabaseRepository()
        self.vector_store = VectorStore()

    def test_connection(self):
        """Test if we can establish a connection to PostgreSQL."""
        try:
            conn = get_connection()
            self.assertIsNotNone(conn)
            conn.close()
        except Exception as e:
            self.fail(f"Database connection failed: {e}")

    def test_user_role_retrieval(self):
        """Test retrieving a user and their role."""
        # User 1 is usually admin in seed.sql
        user = self.repo.get_user_by_id(1)
        self.assertIsNotNone(user)
        self.assertIn("role_name", user)
        self.assertTrue(len(user["full_name"]) > 0)

    def test_conversation_persistence(self):
        """Test creating a conversation and adding messages."""
        user_id = 1
        conv_id = self.repo.create_conversation(user_id=user_id, title="Test Conv")

        self.repo.add_message(conv_id, "user", "Hello AI")
        self.repo.add_message(conv_id, "assistant", "Hello User")

        history = self.repo.get_conversation_history(conv_id)
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0]["sender"], "user")
        self.assertEqual(history[0]["message_text"], "Hello AI")

    def test_audit_logging(self):
        """Test inserting and retrieving audit logs."""
        self.repo.log_audit_event(
            user_id=1,
            action="TEST_ACTION",
            entity_type="TEST_ENTITY",
            details="Testing audit log integration"
        )
        logs = self.repo.get_audit_logs(limit=10)
        self.assertTrue(any(log["action"] == "TEST_ACTION" for log in logs))

    def test_rag_vector_storage(self):
        """Test storing and retrieving a vector chunk."""
        # We need a valid document_id first. Assume 1 exists from seed.sql
        doc_id = 1
        embedding = [0.1] * 1024
        metadata = {"source": "test_file", "page": 1}

        # Using VectorStore to store
        # Since store_chunks expects a list of dicts
        chunks = [{
            "text": "This is a test chunk",
            "embedding": embedding,
            "metadata": metadata,
            "chunk_index": 1
        }]

        try:
            self.vector_store.store_chunks(doc_id, chunks)
            results = self.vector_store.search_similar_chunks(embedding, top_k=1)
            self.assertTrue(len(results) > 0)
            self.assertEqual(results[0][3], "This is a test chunk")
        except Exception as e:
            self.fail(f"RAG vector storage failed: {e}")

if __name__ == "__main__":
    unittest.main()
