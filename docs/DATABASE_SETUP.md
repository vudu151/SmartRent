# Database Setup Guide - SmartRent

Hướng dẫn cấu hình kết nối PostgreSQL cho SmartRent Backend.

## 🔧 Cấu Hình Database Password

### Cách 1: Sử dụng Environment Variable (Khuyến nghị)

**Windows PowerShell:**
```powershell
# Set environment variable cho session hiện tại
$env:DB_PASSWORD = "your_postgres_password"

# Hoặc set vĩnh viễn (yêu cầu restart terminal)
setx DB_PASSWORD "your_postgres_password"
```

**Windows CMD:**
```cmd
setx DB_PASSWORD "your_postgres_password"
```

**Linux/Mac:**
```bash
export DB_PASSWORD="your_postgres_password"
```

Sau khi set, restart terminal và chạy lại ứng dụng.

### Cách 2: Tạo file `application-local.properties` (Khuyến nghị cho development)

Tạo file `src/main/resources/application-local.properties`:

```properties
# Local Database Configuration
spring.datasource.password=your_postgres_password
```

File này đã được gitignore nên sẽ không bị commit vào Git.

### Cách 3: Sửa trực tiếp trong `application.properties` (Không khuyến nghị)

⚠️ **Lưu ý**: Cách này không an toàn vì có thể commit password vào Git.

Sửa dòng 8 trong `application.properties`:
```properties
spring.datasource.password=your_postgres_password
```

## 📋 Kiểm Tra Database

### 1. Kiểm tra PostgreSQL đang chạy

**Windows:**
```powershell
# Kiểm tra service
Get-Service -Name postgresql*

# Hoặc kiểm tra process
Get-Process -Name postgres
```

**Linux/Mac:**
```bash
# Kiểm tra service
sudo systemctl status postgresql

# Hoặc kiểm tra process
ps aux | grep postgres
```

### 2. Kiểm tra kết nối

**Sử dụng psql:**
```bash
psql -U postgres -d smartrent_dev
```

**Hoặc sử dụng pgAdmin 4**

### 3. Tạo database nếu chưa có

```sql
-- Kết nối PostgreSQL
psql -U postgres

-- Tạo database
CREATE DATABASE smartrent_dev;

-- Kiểm tra
\l
```

## 🚀 Chạy Ứng Dụng

Sau khi cấu hình password:

```bash
# Chạy với profile dev
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Hoặc chạy trực tiếp
mvn spring-boot:run
```

## 🐛 Troubleshooting

### Lỗi: "password authentication failed"

**Nguyên nhân:**
- Password không đúng
- Environment variable chưa được set
- PostgreSQL chưa được cấu hình đúng

**Giải pháp:**
1. Kiểm tra password PostgreSQL trong pgAdmin hoặc psql
2. Set environment variable `DB_PASSWORD`
3. Restart terminal và chạy lại ứng dụng

### Lỗi: "database does not exist"

**Giải pháp:**
```sql
CREATE DATABASE smartrent_dev;
```

### Lỗi: "connection refused"

**Nguyên nhân:**
- PostgreSQL chưa chạy
- Port không đúng (mặc định 5432)
- Firewall chặn

**Giải pháp:**
1. Start PostgreSQL service
2. Kiểm tra port trong `application.properties`
3. Kiểm tra firewall settings

## 📝 Lưu Ý

- ⚠️ **KHÔNG** commit password vào Git
- ✅ Sử dụng environment variables hoặc `application-local.properties`
- ✅ File `application-local.properties` đã được gitignore
- ✅ Trong production, sử dụng environment variables hoặc secrets management
