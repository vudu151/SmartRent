-- SmartRent Data Seeding via Flyway (Version 2)
-- Author: Antigravity AI

-- 0. Tạo tài khoản SuperAdmin dự phòng để đảm bảo Login thành công
-- Username: superadmin / Password: admin123
INSERT INTO users (tenant_id, username, email, password_hash, full_name, role, status)
SELECT 1, 'superadmin', 'superadmin@smartrent.com', '$2y$10$r8S3.U9T68fU9fV.k8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'Super Admin Test', 'SUPER_ADMIN', 'ACTIVE'
ON CONFLICT (username) DO NOTHING;

-- 1. Thêm Chủ trọ (Tenants)
INSERT INTO tenants (name, email, phone, address, status) VALUES
('Nhà Trọ Thanh Xuân', 'thanhxuan@gmail.com', '0987654321', '123 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'ACTIVE'),
('Chung Cư Mini Cầu Giấy', 'caugiay.rent@gmail.com', '0912345678', '45 Xuân Thủy, Cầu Giấy, Hà Nội', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- 2. Thêm Phòng trọ (Rooms)
INSERT INTO rooms (tenant_id, room_number, floor, area, status, type, price, description) 
SELECT id, '101', 1, 25.5, 'OCCUPIED', 'STANDARD', 3500000, 'Phòng tầng 1, thoáng mát' FROM tenants WHERE email = 'thanhxuan@gmail.com'
ON CONFLICT DO NOTHING;
INSERT INTO rooms (tenant_id, room_number, floor, area, status, type, price, description) 
SELECT id, '102', 1, 25.5, 'VACANT', 'STANDARD', 3500000, 'Phòng tầng 1, trống' FROM tenants WHERE email = 'thanhxuan@gmail.com'
ON CONFLICT DO NOTHING;
INSERT INTO rooms (tenant_id, room_number, floor, area, status, type, price, description) 
SELECT id, '201', 2, 30.0, 'OCCUPIED', 'PREMIUM', 4500000, 'Phòng tầng 2, có ban công' FROM tenants WHERE email = 'thanhxuan@gmail.com'
ON CONFLICT DO NOTHING;
INSERT INTO rooms (tenant_id, room_number, floor, area, status, type, price, description) 
SELECT id, 'A01', 1, 22.0, 'OCCUPIED', 'STANDARD', 2800000, 'Phòng A01 Cầu Giấy' FROM tenants WHERE email = 'caugiay.rent@gmail.com'
ON CONFLICT DO NOTHING;

-- 3. Thêm Cư dân (Residents)
INSERT INTO residents (tenant_id, full_name, email, phone, id_card, status)
SELECT id, 'Nguyễn Văn A', 'vana@gmail.com', '0901111111', '123456789', 'ACTIVE' FROM tenants WHERE email = 'thanhxuan@gmail.com'
ON CONFLICT DO NOTHING;
INSERT INTO residents (tenant_id, full_name, email, phone, id_card, status)
SELECT id, 'Trần Thị B', 'thib@gmail.com', '0902222222', '123456780', 'ACTIVE' FROM tenants WHERE email = 'thanhxuan@gmail.com'
ON CONFLICT DO NOTHING;

-- 4. Thêm Hợp đồng (Contracts)
INSERT INTO contracts (tenant_id, room_id, resident_id, contract_number, start_date, end_date, monthly_rent, deposit_amount, status)
SELECT t.id, r.id, res.id, 'HD-TX-101', '2026-01-01', '2027-01-01', 3500000, 3500000, 'ACTIVE'
FROM tenants t, rooms r, residents res 
WHERE t.email = 'thanhxuan@gmail.com' AND r.room_number = '101' AND res.full_name = 'Nguyễn Văn A'
ON CONFLICT DO NOTHING;

-- 5. Thêm Hóa đơn mẫu (Bills)
INSERT INTO bills (tenant_id, room_id, contract_id, title, amount, status, due_date)
SELECT t.id, r.id, c.id, 'Hóa đơn tháng 04/2026', 3850000, 'UNPAID', '2026-04-15'
FROM tenants t, rooms r, contracts c
WHERE t.email = 'thanhxuan@gmail.com' AND r.room_number = '101' AND c.contract_number = 'HD-TX-101'
ON CONFLICT DO NOTHING;
