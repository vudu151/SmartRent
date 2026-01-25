# Scripts Directory

Thư mục này chứa các scripts tiện ích cho việc phát triển và testing SmartRent.

## 📁 Cấu Trúc

### SQL Scripts

#### 01_create_tenants_table.sql
Tạo bảng `tenants` để quản lý chủ trọ.

**Chạy:**
```bash
psql -U postgres -d smartrent_dev -f 01_create_tenants_table.sql
```

#### 02_create_roles_and_permissions.sql
Tạo bảng `roles`, `permissions` và dữ liệu mặc định (roles, permissions, và mapping).

**Chạy:**
```bash
psql -U postgres -d smartrent_dev -f 02_create_roles_and_permissions.sql
```

#### 03_create_users_table.sql
Tạo bảng `users` và `user_roles`.

**Chạy:**
```bash
psql -U postgres -d smartrent_dev -f 03_create_users_table.sql
```

#### 04_create_default_admin_user.sql
Tạo user admin mặc định để test hệ thống.

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ WARNING:** Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!

**Chạy:**
```bash
psql -U postgres -d smartrent_dev -f 04_create_default_admin_user.sql
```

#### create_test_users.sql
Tạo các test users với các roles khác nhau để testing.

**Test Users:**
- `tenant_admin` / `test123` - TENANT_ADMIN role
- `manager` / `test123` - TENANT_MANAGER role
- `staff` / `test123` - TENANT_STAFF role

**Chạy:**
```bash
psql -U postgres -d smartrent_dev -f create_test_users.sql
```

### Utility Scripts

#### generate_password_hash.java
Utility để tạo BCrypt hash cho password.

**Sử dụng:**
```bash
# Compile (cần thêm Spring Security vào classpath)
javac -cp "path/to/spring-security-crypto.jar" generate_password_hash.java

# Run
java -cp ".:path/to/spring-security-crypto.jar" generate_password_hash admin123
```

**Hoặc sử dụng online tool:**
- https://bcrypt-generator.com/
- https://www.bcrypt.fr/

### Testing Scripts

#### test_login.sh (Linux/Mac)
Script để test đăng nhập và lấy JWT token.

**Sử dụng:**
```bash
# Sử dụng credentials mặc định (admin/admin123)
./test_login.sh

# Hoặc chỉ định username và password
./test_login.sh myuser mypassword
```

**Output:**
- Lưu access token vào `.access_token.txt`
- Lưu refresh token vào `.refresh_token.txt`

#### test_login.ps1 (Windows PowerShell)
Script tương tự cho Windows.

**Sử dụng:**
```powershell
# Sử dụng credentials mặc định
.\test_login.ps1

# Hoặc chỉ định username và password
.\test_login.ps1 -Username myuser -Password mypassword
```

#### test_api.sh (Linux/Mac)
Script để test các API endpoints với JWT token.

**Sử dụng:**
```bash
# Test health endpoint
./test_api.sh /api/health

# Test users endpoint
./test_api.sh /api/users GET

# Test POST endpoint
./test_api.sh /api/users POST '{"username":"test","password":"test123"}'
```

**Yêu cầu:**
- Phải chạy `test_login.sh` trước để có access token

## 🚀 Quick Start

### 1. Setup Database và User

**Option A: Sử dụng script PowerShell (Windows)**
```powershell
.\create_db_user.ps1
```

**Option B: Sử dụng SQL script**
```bash
# Kết nối PostgreSQL với user postgres
psql -U postgres

# Chạy script
\i docs/scripts/05_create_database_and_user.sql
```

**Option C: Chạy thủ công**
```sql
-- Kết nối PostgreSQL
psql -U postgres

-- Tạo user
CREATE USER smartrent_dev WITH PASSWORD '123456';

-- Tạo database
CREATE DATABASE smartrent_dev OWNER smartrent_dev;

-- Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE smartrent_dev TO smartrent_dev;

-- Kết nối vào database
\c smartrent_dev

-- Cấp quyền schema
GRANT ALL ON SCHEMA public TO smartrent_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smartrent_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO smartrent_dev;
```

### 2. Chạy Migrations

Migrations sẽ tự động chạy khi start app (Flyway). Hoặc chạy thủ công:
```bash
psql -U smartrent_dev -d smartrent_dev -f docs/scripts/01_create_tenants_table.sql
psql -U smartrent_dev -d smartrent_dev -f docs/scripts/02_create_roles_and_permissions.sql
psql -U smartrent_dev -d smartrent_dev -f docs/scripts/03_create_users_table.sql
psql -U smartrent_dev -d smartrent_dev -f docs/scripts/04_create_default_admin_user.sql
```

### 2. Test Login

**Linux/Mac:**
```bash
chmod +x test_login.sh
./test_login.sh
```

**Windows:**
```powershell
.\test_login.ps1
```

### 3. Test API

**Linux/Mac:**
```bash
chmod +x test_api.sh
./test_api.sh /api/health
```

## 📝 Notes

- Tất cả SQL scripts đều có `ON CONFLICT` để tránh lỗi khi chạy lại
- Scripts testing yêu cầu `jq` (JSON processor) trên Linux/Mac
- Access tokens được lưu trong `.access_token.txt` và `.refresh_token.txt`
- **KHÔNG commit** các file token vào Git!

## 🔒 Security

- ⚠️ **KHÔNG** sử dụng default passwords trong production
- ⚠️ **ĐỔI** mật khẩu admin ngay sau lần đăng nhập đầu tiên
- ⚠️ **XÓA** các test users trước khi deploy production
- ⚠️ **KHÔNG** commit các file chứa tokens vào Git

## 🐛 Troubleshooting

### Lỗi: "psql: command not found"
- Cài đặt PostgreSQL client tools
- Hoặc sử dụng pgAdmin để chạy scripts

### Lỗi: "jq: command not found" (Linux/Mac)
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

### Lỗi: "Access token not found"
- Chạy `test_login.sh` hoặc `test_login.ps1` trước
- Kiểm tra file `.access_token.txt` có tồn tại không

### Lỗi: "Connection refused"
- Đảm bảo backend đang chạy tại `http://localhost:8080`
- Kiểm tra `application.properties` có đúng port không

## 📚 References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [BCrypt Online Generator](https://bcrypt-generator.com/)
- [JWT.io](https://jwt.io/) - JWT token decoder
