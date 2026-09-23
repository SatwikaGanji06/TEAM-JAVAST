CREATE TABLE IF NOT EXISTS generated_documents (
    generated_document_id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    source_query TEXT NOT NULL,
    document_ids INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
