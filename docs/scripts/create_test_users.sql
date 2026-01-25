-- ============================================
-- Script: Create Test Users
-- Description: Tạo các test users với các roles khác nhau
-- ============================================
-- WARNING: Chỉ sử dụng trong môi trường development/test!

-- Tạo test tenant
INSERT INTO tenants (name, email, phone, status) VALUES
('Test Tenant', 'test@smartrent.com', '0987654321', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Tạo test users với các roles khác nhau
-- Password cho tất cả: test123 (BCrypt hash: $2a$10$8K1p/a0dL1LX1s0K1p/a0dL1LX1s0K1p/a0dL1LX1s0K1p/a0dL1LX1s0)

-- TENANT_ADMIN user
INSERT INTO users (tenant_id, username, email, password_hash, full_name, role, status)
SELECT 
    t.id,
    'tenant_admin',
    'tenant_admin@smartrent.com',
    '$2a$10$8K1p/a0dL1LX1s0K1p/a0dL1LX1s0K1p/a0dL1LX1s0K1p/a0dL1LX1s0', -- BCrypt hash of "test123"
    'Tenant Administrator',
    'TENANT_ADMIN',
    'ACTIVE'
FROM tenants t
WHERE t.email = 'test@smartrent.com'
ON CONFLICT (username) DO NOTHING;

-- TENANT_MANAGER user
INSERT INTO users (tenant_id, username, email, password_hash, full_name, role, status)
SELECT 
    t.id,
    'manager',
    'manager@smartrent.com',
    '$2a$10$8K1p/a0dL1LX1s0K1p/a0dL1LX1s0K1p/a0dL1LX1s0K1p/a0dL1LX1s0',
    'Property Manager',
    'TENANT_MANAGER',
    'ACTIVE'
FROM tenants t
WHERE t.email = 'test@smartrent.com'
ON CONFLICT (username) DO NOTHING;

-- TENANT_STAFF user
INSERT INTO users (tenant_id, username, email, password_hash, full_name, role, status)
SELECT 
    t.id,
    'staff',
    'staff@smartrent.com',
    '$2a$10$8K1p/a0dL1LX1s0K1p/a0dL1LX1s0K1p/a0dL1LX1s0K1p/a0dL1LX1s0',
    'Staff Member',
    'TENANT_STAFF',
    'ACTIVE'
FROM tenants t
WHERE t.email = 'test@smartrent.com'
ON CONFLICT (username) DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'tenant_admin' AND r.name = 'TENANT_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'manager' AND r.name = 'TENANT_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'staff' AND r.name = 'TENANT_STAFF'
ON CONFLICT DO NOTHING;

-- Display created users
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.status,
    t.name as tenant_name
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.email LIKE '%@smartrent.com'
ORDER BY u.id;
