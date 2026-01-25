-- ============================================
-- Script: Fix Admin Password
-- Description: Kiểm tra và cập nhật password cho user admin
-- Usage: Chạy trong database smartrent_dev
-- ============================================

-- Kiểm tra user admin có tồn tại không
SELECT id, username, email, password_hash, role, status 
FROM users 
WHERE username = 'admin' OR email = 'admin@smartrent.com';

-- Nếu user không tồn tại, tạo lại user admin
-- Trước tiên đảm bảo tenant tồn tại
INSERT INTO tenants (name, email, phone, status) 
VALUES ('System Admin', 'admin@smartrent.com', '0123456789', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Cập nhật hoặc tạo user admin với password hash mới
-- Password: admin123
-- Hash này được tạo bằng BCryptPasswordEncoder với strength 10
INSERT INTO users (tenant_id, username, email, password_hash, full_name, role, status)
SELECT 
    t.id,
    'admin',
    'admin@smartrent.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- BCrypt hash of "admin123"
    'System Administrator',
    'SUPER_ADMIN',
    'ACTIVE'
FROM tenants t
WHERE t.email = 'admin@smartrent.com'
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP;

-- Kiểm tra lại sau khi cập nhật
SELECT id, username, email, role, status, 
       LENGTH(password_hash) as hash_length,
       SUBSTRING(password_hash, 1, 7) as hash_prefix
FROM users 
WHERE username = 'admin';

-- Gán role SUPER_ADMIN cho user admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;
