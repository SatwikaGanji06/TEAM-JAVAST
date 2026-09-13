import os
import psycopg
from psycopg.types.json import Jsonb
from pgvector.psycopg import register_vector
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_connection():
    """
    Establish and return a PostgreSQL connection.
    Uses environment variables for configuration.
    """
    # Priority: DATABASE_URL > individual params
    db_url = os.getenv("DATABASE_URL")

    if db_url:
        conn = psycopg.connect(db_url, autocommit=True)
    else:
        conn = psycopg.connect(
            dbname=os.getenv("DATABASE_NAME", "ai_workbench"),
            user=os.getenv("DATABASE_USER", "postgres"),
            password=os.getenv("DATABASE_PASSWORD", ""),
            host=os.getenv("DATABASE_HOST", "localhost"),
            port=os.getenv("DATABASE_PORT", "5432"),
            autocommit=True
        )

    # Register pgvector for all connections
    register_vector(conn)
    return conn
