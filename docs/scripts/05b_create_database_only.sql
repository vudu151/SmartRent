-- ============================================
-- Script: Create Database Only
-- Description: Tạo database cho SmartRent (phần 2)
-- Usage: Chạy SAU KHI đã chạy script tạo user (05_create_database_and_user.sql - PART 1)
--        Phải chạy riêng biệt, không trong transaction block
-- ============================================

-- Tạo database nếu chưa tồn tại
-- Note: Nếu database đã tồn tại, lệnh này sẽ báo lỗi nhưng có thể bỏ qua
CREATE DATABASE smartrent_dev OWNER smartrent_dev;

-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE smartrent_dev TO smartrent_dev;
