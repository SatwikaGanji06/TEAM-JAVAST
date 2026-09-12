INSERT INTO roles (role_name, description)
VALUES
('Admin', 'Full system access'),
('Employee', 'Can upload documents and use AI'),
('Auditor', 'Can view audit logs'),
('AI Engineer', 'Can manage AI models');
SELECT * FROM roles;
INSERT INTO users
(full_name, email, password_hash, role_id)
VALUES
('Admin User', 'admin@mrpl.com', 'hashed_password_123', 1),

('Rahul Kumar', 'rahul@mrpl.com', 'hashed_password_456', 2),

('Priya Sharma', 'priya@mrpl.com', 'hashed_password_789', 4);
SELECT * FROM users;
INSERT INTO documents
(file_name, original_file_name, file_type, file_size, storage_path, uploaded_by)
VALUES
(
'process_manual_001.pdf',
'MRPL Process Manual.pdf',
'pdf',
2456789,
'/documents/process_manual_001.pdf',
2
),

(
'safety_guidelines.pdf',
'Safety Guidelines.pdf',
'pdf',
1345000,
'/documents/safety_guidelines.pdf',
3
),

(
'maintenance_report.xlsx',
'Maintenance Report.xlsx',
'xlsx',
850000,
'/documents/maintenance_report.xlsx',
2
);
SELECT * FROM documents;
INSERT INTO conversations (user_id, title)
VALUES
(2, 'Crude Oil Safety Manual'),
(3, 'Equipment Maintenance'),
(1, 'Admin Testing');
SELECT * FROM conversations;
INSERT INTO messages
(conversation_id, sender, message_text)
VALUES
(1, 'user', 'Summarize the refinery safety manual.'),
(1, 'assistant', 'The manual emphasizes PPE, emergency shutdown procedures, and fire safety.'),
(2, 'user', 'Generate preventive maintenance checklist.'),
(2, 'assistant', 'Here is a preventive maintenance checklist for refinery pumps...');
SELECT * FROM messages;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
INSERT INTO document_chunks
(document_id, chunk_index, chunk_text)

VALUES

(1, 1,
'Refinery personnel must wear helmets, gloves and safety shoes while entering restricted areas.'),

(1, 2,
'Emergency shutdown procedures should be initiated immediately after detecting gas leakage.'),

(2, 1,
'Maintenance schedules for pumps should be followed every six months.');
SELECT * FROM document_chunks;
INSERT INTO audit_logs
(user_id, action, entity_type, entity_id, details, ip_address, model, success, external_call)

VALUES

(
1,
'LOGIN',
'USER',
1,
'Admin logged into the system',
'127.0.0.1',
NULL,
TRUE,
FALSE
),

(
2,
'UPLOAD_DOCUMENT',
'DOCUMENT',
1,
'Uploaded Refinery_Safety_Manual.pdf',
'127.0.0.1',
NULL,
TRUE,
FALSE
),

(
2,
'CHAT_STARTED',
'CONVERSATION',
1,
'Started a new AI conversation',
'127.0.0.1',
'llama3.2:3b',
TRUE,
FALSE
),

(
3,
'CHAT_QUERY',
'CONVERSATION',
2,
'Asked AI to summarize the maintenance manual',
'127.0.0.1',
'gemma3:4b',
TRUE,
FALSE
),

(
1,
'MODEL_SWITCH',
'SYSTEM',
NULL,
'Switched default model from Gemma to Llama',
'127.0.0.1',
'llama3.2:3b',
TRUE,
FALSE
);
SELECT * FROM audit_logs;