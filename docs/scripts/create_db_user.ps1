# ============================================
# Script: Create Database and User (PowerShell)
# Description: Tạo database và user PostgreSQL cho SmartRent
# Usage: .\create_db_user.ps1
# ============================================

Write-Host "============================================"
Write-Host "SmartRent - Create Database and User"
Write-Host "============================================"
Write-Host ""

# Yêu cầu password của user postgres
$postgresPassword = Read-Host "Enter PostgreSQL postgres user password"

# Tạo user
Write-Host "Creating user smartrent_dev..." -ForegroundColor Cyan
$createUserSQL = "DO `$`$`nBEGIN`n    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'smartrent_dev') THEN`n        CREATE USER smartrent_dev WITH PASSWORD '123456';`n        RAISE NOTICE 'User smartrent_dev created';`n    ELSE`n        RAISE NOTICE 'User smartrent_dev already exists';`n    END IF;`nEND`n`$`$;"

# Tạo database
Write-Host "Creating database smartrent_dev..." -ForegroundColor Cyan
$createDbSQL = "SELECT 'CREATE DATABASE smartrent_dev OWNER smartrent_dev' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'smartrent_dev');"

# Cấp quyền
Write-Host "Granting privileges..." -ForegroundColor Cyan
$grantSQL = "GRANT ALL PRIVILEGES ON DATABASE smartrent_dev TO smartrent_dev;"

# Sử dụng psql để thực thi
$env:PGPASSWORD = $postgresPassword

Write-Host ""
Write-Host "Executing SQL commands..." -ForegroundColor Yellow
Write-Host ""

# Chạy từng lệnh
psql -U postgres -c $createUserSQL
psql -U postgres -c $createDbSQL
psql -U postgres -c $grantSQL

# Kết nối vào database và cấp quyền schema
Write-Host ""
Write-Host "Setting up schema permissions..." -ForegroundColor Cyan
$schemaSQL = @"
GRANT ALL ON SCHEMA public TO smartrent_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smartrent_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO smartrent_dev;
"@

psql -U postgres -d smartrent_dev -c $schemaSQL

# Xóa password từ environment
Remove-Item Env:\PGPASSWORD

Write-Host ""
Write-Host "============================================"
Write-Host "✅ Database and user setup completed!" -ForegroundColor Green
Write-Host "============================================"
Write-Host ""
Write-Host "Database: smartrent_dev"
Write-Host "Username: smartrent_dev"
Write-Host "Password: 123456"
Write-Host ""
Write-Host "You can now run the application:" -ForegroundColor Cyan
Write-Host "  mvn spring-boot:run" -ForegroundColor Green
