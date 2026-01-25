-- ============================================
-- Script: Check and Fix Admin User
-- Description: Kiểm tra và sửa user admin nếu có vấn đề
-- Usage: Chạy trong database smartrent_dev
-- ============================================

-- Bước 1: Kiểm tra tenant có tồn tại không
SELECT 'Checking tenant...' as step;
SELECT id, name, email, status FROM tenants WHERE email = 'admin@smartrent.com';

-- Bước 2: Kiểm tra user admin có tồn tại không
SELECT 'Checking user...' as step;
SELECT 
    id, 
    username, 
    email, 
    CASE 
        WHEN password_hash IS NULL THEN 'NULL'
        WHEN LENGTH(password_hash) < 50 THEN 'TOO_SHORT'
        WHEN password_hash NOT LIKE '$2a$%' THEN 'INVALID_FORMAT'
        ELSE 'OK'
    END as hash_status,
    LENGTH(password_hash) as hash_length,
    role,
    status
FROM users 
WHERE username = 'admin' OR email = 'admin@smartrent.com';

-- Bước 3: Tạo tenant nếu chưa có
INSERT INTO tenants (name, email, phone, status) 
VALUES ('System Admin', 'admin@smartrent.com', '0123456789', 'ACTIVE')
ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE';

-- Bước 4: Cập nhật hoặc tạo user admin
-- Password: admin123
-- BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (tenant_id, username, email, password_hash, full_name, role, status)
SELECT 
    t.id,
    'admin',
    'admin@smartrent.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    'SUPER_ADMIN',
    'ACTIVE'
FROM tenants t
WHERE t.email = 'admin@smartrent.com'
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP;

-- Bước 5: Gán role SUPER_ADMIN
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- Bước 6: Kiểm tra kết quả cuối cùng
SELECT 'Final check...' as step;
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.status,
    t.name as tenant_name,
    COUNT(ur.role_id) as assigned_roles
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.username = 'admin'
GROUP BY u.id, u.username, u.email, u.role, u.status, t.name;
