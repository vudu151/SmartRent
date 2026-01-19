# SmartRent Backend

Backend API cho hệ thống quản lý nhà trọ SmartRent, được xây dựng với Spring Boot 4.0.1.

## 🛠️ Công Nghệ

- **Spring Boot**: 4.0.1
- **Java**: 17
- **Database**: PostgreSQL 14+
- **Build Tool**: Maven 3.8+
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA / Hibernate
- **Migration**: Flyway

## 📋 Yêu Cầu

- Java 17 hoặc cao hơn
- Maven 3.8+
- PostgreSQL 14+
- IDE: IntelliJ IDEA / Eclipse / VS Code

## 🚀 Cài Đặt & Chạy

### 1. Clone và chuyển vào thư mục

```bash
git checkout BE
cd BE
```

### 2. Tạo Database

```sql
CREATE DATABASE smartrent_dev;
```

### 3. Cấu hình Database

Sửa file `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 4. Build và chạy

```bash
# Build project
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Hoặc chạy trực tiếp từ IDE bằng cách run class `SmartRentApplication`.

### 5. Kiểm tra

Ứng dụng sẽ chạy tại: `http://localhost:8080`

Health check: `http://localhost:8080/api/health`

## 📁 Cấu Trúc Dự Án

```
src/
├── main/
│   ├── java/com/smartrent/
│   │   ├── SmartRentApplication.java    # Main class
│   │   ├── config/                       # Configuration classes
│   │   ├── controller/                   # REST Controllers
│   │   ├── service/                      # Business logic
│   │   ├── repository/                   # Data access layer
│   │   ├── domain/                       # Entity classes
│   │   ├── dto/                          # Data Transfer Objects
│   │   ├── mapper/                       # Entity-DTO mappers
│   │   ├── security/                     # Security components
│   │   └── exception/                    # Exception handling
│   └── resources/
│       ├── application.properties        # Main config
│       ├── application-dev.properties     # Dev profile
│       ├── application-prod.properties    # Prod profile
│       └── db/migration/                  # Flyway migrations
└── test/                                  # Test classes
```

## 🔧 Cấu Hình

### Profiles

- **Default**: Sử dụng `application.properties`
- **Dev**: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`
- **Prod**: `mvn spring-boot:run -Dspring-boot.run.profiles=prod`

### Environment Variables (Production)

```bash
DB_URL=jdbc:postgresql://localhost:5432/smartrent_prod
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-min-256-bits
JWT_EXPIRATION=86400000
```

## 📚 API Documentation

API sẽ được document tại: `http://localhost:8080/api`

Xem chi tiết API specification tại: [../docs/API.md](../docs/API.md)

## 🧪 Testing

```bash
# Chạy tất cả tests
mvn test

# Chạy với coverage
mvn test jacoco:report
```

## 📦 Build JAR

```bash
mvn clean package
```

File JAR sẽ được tạo tại: `target/smartrent-backend-1.0.0-SNAPSHOT.jar`

Chạy JAR:
```bash
java -jar target/smartrent-backend-1.0.0-SNAPSHOT.jar
```

## 🔐 Security

- JWT Authentication
- Spring Security
- CORS configuration
- Password encryption (BCrypt)

## 📝 Dependencies Chính

- `spring-boot-starter-web` - Web framework
- `spring-boot-starter-data-jpa` - JPA/Hibernate
- `spring-boot-starter-security` - Security
- `postgresql` - PostgreSQL driver
- `jjwt` - JWT library
- `lombok` - Reduce boilerplate
- `mapstruct` - DTO mapping
- `flyway-core` - Database migration

## 🐛 Troubleshooting

### Database Connection Error
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra credentials trong `application.properties`
- Kiểm tra firewall settings

### Port Already in Use
- Đổi port trong `application.properties`: `server.port=8081`

### Maven Build Error
- Xóa `.m2/repository` và build lại
- Kiểm tra Java version: `java -version`

## 📞 Liên Hệ

Xem tài liệu chính tại: [../README.md](../README.md)

---

**Lưu ý**: Đây là project cơ bản. Các tính năng sẽ được phát triển dần theo tài liệu đặc tả.
