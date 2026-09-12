INSERT INTO roles (role_name, description)
VALUES
('Admin', 'Full system access'),
('Employee', 'Can upload documents and use AI'),
('Auditor', 'Can view audit logs'),
('AI Engineer', 'Can manage AI models');
SELECT * FROM roles;