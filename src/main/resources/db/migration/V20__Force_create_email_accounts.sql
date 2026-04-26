-- Dọn dẹp conflict
UPDATE users SET username = username || '_old' WHERE username IN ('admin@gmail.com', 'tenant@gmail.com', 'resident@gmail.com', 'guard@gmail.com');
UPDATE users SET email = email || '_old' WHERE email IN ('admin@gmail.com', 'tenant@gmail.com', 'resident@gmail.com', 'guard@gmail.com');

-- Tạo tài khoản chuẩn
INSERT INTO users (username, password_hash, full_name, email, role, status, created_at, updated_at)
VALUES ('admin@gmail.com', '$2a$10$zwFdpuOzYOq4QZqIfOIlT.hOZ68o0n7NGLOQTf/CUnghI4hyacLk.', 'Super Admin', 'admin@gmail.com', 'SUPER_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (username, password_hash, full_name, email, role, status, created_at, updated_at)
VALUES ('tenant@gmail.com', '$2a$10$zwFdpuOzYOq4QZqIfOIlT.hOZ68o0n7NGLOQTf/CUnghI4hyacLk.', 'Chủ Trọ', 'tenant@gmail.com', 'TENANT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (username, password_hash, full_name, email, role, status, created_at, updated_at)
VALUES ('resident@gmail.com', '$2a$10$zwFdpuOzYOq4QZqIfOIlT.hOZ68o0n7NGLOQTf/CUnghI4hyacLk.', 'Khách Thuê', 'resident@gmail.com', 'RESIDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (username, password_hash, full_name, email, role, status, created_at, updated_at)
VALUES ('guard@gmail.com', '$2a$10$zwFdpuOzYOq4QZqIfOIlT.hOZ68o0n7NGLOQTf/CUnghI4hyacLk.', 'Bảo Vệ', 'guard@gmail.com', 'GUARD', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
