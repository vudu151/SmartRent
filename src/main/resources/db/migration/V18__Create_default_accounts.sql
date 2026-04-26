-- Tạo hoặc cập nhật tài khoản admin (SUPER_ADMIN)
INSERT INTO users (username, password_hash, full_name, email, role, status, created_at, updated_at)
VALUES ('admin', '$2a$10$zwFdpuOzYOq4QZqIfOIlT.hOZ68o0n7NGLOQTf/CUnghI4hyacLk.', 'Super Admin', 'admin@system.com', 'SUPER_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name;

-- Tạo hoặc cập nhật tài khoản tenant (TENANT)
INSERT INTO users (username, password_hash, full_name, email, role, status, created_at, updated_at)
VALUES ('tenant', '$2a$10$zwFdpuOzYOq4QZqIfOIlT.hOZ68o0n7NGLOQTf/CUnghI4hyacLk.', 'Chủ Trọ', 'tenant@system.com', 'TENANT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name;

-- Tạo hoặc cập nhật tài khoản resident (RESIDENT)
INSERT INTO users (username, password_hash, full_name, email, role, status, created_at, updated_at)
VALUES ('resident', '$2a$10$zwFdpuOzYOq4QZqIfOIlT.hOZ68o0n7NGLOQTf/CUnghI4hyacLk.', 'Khách Thuê', 'resident@system.com', 'RESIDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name;

-- Tạo hoặc cập nhật tài khoản guard (GUARD)
INSERT INTO users (username, password_hash, full_name, email, role, status, created_at, updated_at)
VALUES ('guard', '$2a$10$zwFdpuOzYOq4QZqIfOIlT.hOZ68o0n7NGLOQTf/CUnghI4hyacLk.', 'Bảo Vệ', 'guard@system.com', 'GUARD', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name;
