-- Create default super admin user
-- Password: admin123 (BCrypt hash)
-- You should change this password after first login
INSERT INTO tenants (name, email, phone, status) VALUES
('System Admin', 'admin@smartrent.com', '0123456789', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Create default super admin user
-- Password: admin123
INSERT INTO users (tenant_id, username, email, password_hash, full_name, role, status)
SELECT 
    t.id,
    'admin',
    'admin@smartrent.com',
    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', -- BCrypt hash of "admin123"
    'System Administrator',
    'SUPER_ADMIN',
    'ACTIVE'
FROM tenants t
WHERE t.email = 'admin@smartrent.com'
ON CONFLICT (username) DO NOTHING;

-- Assign SUPER_ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;
