import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

def apply_schema():
    dbname = os.getenv("DATABASE_NAME", "ai_workbench")
    user = os.getenv("DATABASE_USER", "postgres")
    password = os.getenv("DATABASE_PASSWORD", "")
    host = os.getenv("DATABASE_HOST", "localhost")
    port = os.getenv("DATABASE_PORT", "5432")

    try:
        conn = psycopg.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port,
            autocommit=True
        )
        with conn.cursor() as cur:
            print("Enabling pgvector extension...")
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")

            print("Adding embedding column to document_chunks...")
            cur.execute("ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(1024);")

            print("Adding metadata column to document_chunks...")
            cur.execute("ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS metadata JSONB;")

            print("Schema updated successfully.")
        conn.close()
    except Exception as e:
        print(f"Error applying schema: {e}")

if __name__ == "__main__":
    apply_schema()
