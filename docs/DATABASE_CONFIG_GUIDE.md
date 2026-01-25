# Hướng Dẫn Cấu Hình Database - application.properties

Hướng dẫn chi tiết cách điền thông tin database PostgreSQL vào file `application.properties`.

## 📋 Thông Tin Cần Có

Trước khi điền, bạn cần có các thông tin sau:

1. **Host** (địa chỉ server): `localhost` hoặc IP address
2. **Port** (cổng): Mặc định là `5432`
3. **Database Name** (tên database): Ví dụ `smartrent_dev`
4. **Username** (tên người dùng): Ví dụ `postgres` hoặc `smartrent_dev`
5. **Password** (mật khẩu): Mật khẩu của user PostgreSQL

## 📝 Cấu Hình Trong application.properties

### Format Chuẩn

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://HOST:PORT/DATABASE_NAME
spring.datasource.username=USERNAME
spring.datasource.password=PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver
```

### Ví Dụ Cụ Thể

#### Ví dụ 1: Localhost với user postgres
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev
spring.datasource.username=postgres
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
```

#### Ví dụ 2: Localhost với user riêng
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev
spring.datasource.username=smartrent_dev
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
```

#### Ví dụ 3: Remote server
```properties
spring.datasource.url=jdbc:postgresql://192.168.1.100:5432/smartrent_dev
spring.datasource.username=smartrent_dev
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
```

#### Ví dụ 4: Port khác (ví dụ 5433)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/smartrent_dev
spring.datasource.username=smartrent_dev
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
```

## 🔍 Cách Lấy Thông Tin Database

### 1. Từ pgAdmin 4

1. Mở pgAdmin 4
2. Kết nối vào PostgreSQL server
3. Click chuột phải vào server → **Properties**
4. Xem tab **Connection**:
   - **Host**: Thường là `localhost` hoặc `127.0.0.1`
   - **Port**: Thường là `5432`
   - **Maintenance database**: Thường là `postgres`
   - **Username**: User bạn đang dùng (ví dụ `postgres`)
   - **Password**: Password bạn đã set khi cài đặt

### 2. Từ psql Command Line

```bash
# Kết nối PostgreSQL
psql -U postgres

# Xem thông tin kết nối
\conninfo
```

### 3. Từ Connection String

Nếu bạn có connection string dạng:
```
postgresql://username:password@host:port/database
```

Ví dụ: `postgresql://smartrent_dev:123456@localhost:5432/smartrent_dev`

Thì điền vào properties như sau:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev
spring.datasource.username=smartrent_dev
spring.datasource.password=123456
```

## 📄 File application.properties Hiện Tại

File hiện tại của bạn (`src/main/resources/application.properties`):

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev
spring.datasource.username=smartrent_dev
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
```

## ✅ Kiểm Tra Cấu Hình

### 1. Test kết nối bằng psql

```bash
# Test với thông tin trong properties
psql -h localhost -p 5432 -U smartrent_dev -d smartrent_dev
# Nhập password: 123456
```

Nếu kết nối thành công → Cấu hình đúng ✅

### 2. Test từ ứng dụng

```bash
mvn spring-boot:run
```

Nếu không có lỗi kết nối database → Cấu hình đúng ✅

## 🔧 Các Trường Hợp Đặc Biệt

### Nếu dùng SSL

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev?ssl=true
```

### Nếu có schema cụ thể

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev?currentSchema=public
```

### Nếu có tham số kết nối khác

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev?useSSL=false&serverTimezone=UTC
```

## 🐛 Troubleshooting

### Lỗi: "password authentication failed"

**Nguyên nhân**: Password không đúng hoặc user không tồn tại

**Giải pháp**:
1. Kiểm tra password trong pgAdmin
2. Hoặc tạo user mới với password đúng:
   ```sql
   CREATE USER smartrent_dev WITH PASSWORD '123456';
   ```

### Lỗi: "database does not exist"

**Giải pháp**:
```sql
CREATE DATABASE smartrent_dev;
```

### Lỗi: "connection refused"

**Nguyên nhân**: Host hoặc Port không đúng

**Giải pháp**:
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra port trong pgAdmin hoặc `postgresql.conf`
3. Kiểm tra firewall

## 📝 Template Điền Thông Tin

Copy và điền thông tin của bạn:

```properties
# Database Configuration
# Format: jdbc:postgresql://HOST:PORT/DATABASE_NAME
spring.datasource.url=jdbc:postgresql://[HOST]:[PORT]/[DATABASE_NAME]
spring.datasource.username=[USERNAME]
spring.datasource.password=[PASSWORD]
spring.datasource.driver-class-name=org.postgresql.Driver
```

**Ví dụ với thông tin của bạn:**
- Host: `localhost`
- Port: `5432`
- Database: `smartrent_dev`
- Username: `smartrent_dev`
- Password: `123456`

→ Điền vào:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev
spring.datasource.username=smartrent_dev
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
```
