-- ============================================
-- Script: Create Database and User
-- Description: Tạo database và user cho SmartRent
-- Usage: Chạy với quyền superuser (postgres)
-- 
-- IMPORTANT: This script must be run in TWO SEPARATE executions:
--   1. First, run PART 1 (Create User) - can run in transaction
--   2. Then, run PART 2 (Create Database) - MUST run separately, outside transaction
-- 
-- In pgAdmin: Execute each part separately, or use "Execute script" 
-- with autocommit enabled for PART 2
-- ============================================

-- ============================================
-- PART 1: Create User (Run this first)
-- ============================================
-- Tạo user nếu chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'smartrent_dev') THEN
        CREATE USER smartrent_dev WITH PASSWORD '123456';
        RAISE NOTICE 'User smartrent_dev created';
    ELSE
        RAISE NOTICE 'User smartrent_dev already exists';
    END IF;
END
$$;

-- ============================================
-- PART 2: Create Database (Run this separately after PART 1)
-- IMPORTANT: This part MUST be executed in a separate query execution
-- because CREATE DATABASE cannot run inside a transaction block
-- ============================================
-- Tạo database nếu chưa tồn tại
-- Note: Nếu database đã tồn tại, lệnh này sẽ báo lỗi nhưng có thể bỏ qua
CREATE DATABASE smartrent_dev OWNER smartrent_dev;

-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE smartrent_dev TO smartrent_dev;

-- Note: The following commands need to be run after connecting to smartrent_dev database
-- Connect to the database first: \c smartrent_dev
-- Then run the following commands:

-- Cấp quyền trên schema public
-- GRANT ALL ON SCHEMA public TO smartrent_dev;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smartrent_dev;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO smartrent_dev;
