CREATE TABLE IF NOT EXISTS runs (
    run_id SERIAL PRIMARY KEY,
    user_id INTEGER
        REFERENCES users(user_id)
        ON DELETE SET NULL,
    query TEXT NOT NULL,
    task VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL,
    document_ids INTEGER[],
    plan JSONB NOT NULL,
    results JSONB NOT NULL,
    verification JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);