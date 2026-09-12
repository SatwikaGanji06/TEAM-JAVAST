-- Active: 1783241110725@@localhost@5432@ai_workbench
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(30) UNIQUE NOT NULL,
    description TEXT NOT NULL
);
SELECT * FROM roles;