# Authentication & Authorization Module

Module này cung cấp hệ thống xác thực và phân quyền cho SmartRent sử dụng JWT và RBAC.

## ✅ Đã Hoàn Thành

### 1. Domain Entities
- ✅ `Tenant` - Quản lý tenant (chủ trọ)
- ✅ `User` - Người dùng hệ thống (implements UserDetails)
- ✅ `Role` - Vai trò trong hệ thống
- ✅ `Permission` - Quyền truy cập (RESOURCE:ACTION)

### 2. Database Migrations
- ✅ `V2__Create_tenants_table.sql` - Tạo bảng tenants
- ✅ `V3__Create_roles_and_permissions_tables.sql` - Tạo bảng roles, permissions và dữ liệu mặc định
- ✅ `V4__Create_users_table.sql` - Tạo bảng users và user_roles
- ✅ `V5__Create_default_admin_user.sql` - Tạo user admin mặc định

### 3. Repositories
- ✅ `UserRepository` - CRUD và tìm kiếm users
- ✅ `RoleRepository` - CRUD roles
- ✅ `PermissionRepository` - CRUD permissions
- ✅ `TenantRepository` - CRUD tenants

### 4. Security Components
- ✅ `JwtTokenProvider` - Tạo và validate JWT tokens
- ✅ `JwtAuthenticationFilter` - Filter để xác thực JWT trong mỗi request
- ✅ `CustomUserDetailsService` - Load user details cho Spring Security
- ✅ `SecurityConfig` - Cấu hình Spring Security với JWT và CORS

### 5. Services
- ✅ `AuthService` - Xử lý login, logout, refresh token

### 6. Controllers
- ✅ `AuthController` - REST API endpoints cho authentication

### 7. DTOs
- ✅ `LoginRequest` - Request DTO cho login
- ✅ `LoginResponse` - Response DTO với tokens và user info
- ✅ `RefreshTokenRequest` - Request DTO cho refresh token
- ✅ `ApiResponse<T>` - Standard API response wrapper

### 8. Exception Handlers
- ✅ `GlobalExceptionHandler` - Xử lý tất cả exceptions
- ✅ `ResourceNotFoundException` - Exception khi không tìm thấy resource
- ✅ `BusinessException` - Exception cho business logic errors

## 🔐 Default Credentials

Sau khi chạy migrations, bạn có thể đăng nhập với:

```
Username: admin
Password: admin123
```

**⚠️ Lưu ý**: Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!

## 📡 API Endpoints

### POST /api/auth/login
Đăng nhập và nhận JWT tokens.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@smartrent.com",
      "fullName": "System Administrator",
      "tenantId": 1,
      "role": "SUPER_ADMIN",
      "permissions": ["ROLE_SUPER_ADMIN", "ROOM:READ", "ROOM:WRITE", ...]
    }
  },
  "message": "Login successful"
}
```

### POST /api/auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": { ... }
  },
  "message": "Token refreshed successfully"
}
```

### POST /api/auth/logout
Logout (client nên xóa tokens).

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

## 🔑 Sử Dụng JWT Token

Sau khi đăng nhập, gửi token trong header:

```
Authorization: Bearer <accessToken>
```

Ví dụ với curl:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:8080/api/users
```

## 👥 Roles & Permissions

### Default Roles
1. **SUPER_ADMIN** - Quản trị hệ thống (tất cả quyền)
2. **TENANT_ADMIN** - Quản trị tenant (hầu hết quyền)
3. **TENANT_MANAGER** - Quản lý nhà trọ (quản lý phòng, hợp đồng, hóa đơn)
4. **TENANT_STAFF** - Nhân viên (xem và cập nhật cơ bản)
5. **TENANT** - Người thuê trọ (chỉ xem thông tin của mình)

### Default Permissions
- `ROOM:READ`, `ROOM:WRITE`, `ROOM:DELETE`
- `CONTRACT:READ`, `CONTRACT:WRITE`, `CONTRACT:DELETE`
- `INVOICE:READ`, `INVOICE:WRITE`, `INVOICE:DELETE`
- `PAYMENT:READ`, `PAYMENT:WRITE`
- `USER:READ`, `USER:WRITE`, `USER:DELETE`
- `TENANT:READ`, `TENANT:WRITE`
- `REPORT:READ`

## ⚙️ Cấu Hình

### JWT Configuration (application.properties)
```properties
jwt.secret=your-secret-key-change-this-in-production-min-256-bits
jwt.expiration=86400000  # 24 hours in milliseconds
jwt.refresh-expiration=604800000  # 7 days in milliseconds
```

### CORS Configuration
```properties
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

## 🧪 Testing

### Test Login với curl
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Sử dụng token
TOKEN="<accessToken từ response trên>"
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/users
```

### Test với Postman
1. Tạo request POST đến `/api/auth/login`
2. Copy `accessToken` từ response
3. Tạo request mới, thêm header:
   - Key: `Authorization`
   - Value: `Bearer <accessToken>`

## 🔒 Security Features

1. **JWT Tokens**: Stateless authentication
2. **BCrypt Password Hashing**: Passwords được hash với BCrypt
3. **Role-Based Access Control (RBAC)**: Phân quyền theo role và permission
4. **Tenant Isolation**: Mỗi user thuộc một tenant, dữ liệu được phân tách
5. **CORS Protection**: Chỉ cho phép requests từ origins được cấu hình
6. **Token Expiration**: Access token hết hạn sau 24h, refresh token sau 7 ngày

## 📝 Next Steps

Sau khi module Authentication hoàn thành, bạn có thể:

1. **Test API** với Postman hoặc curl
2. **Tạo thêm users** với các roles khác nhau
3. **Tích hợp với Frontend** - Gọi API login từ React app
4. **Implement Module 2**: Tenant Management
5. **Implement Module 3**: User Management

## 🐛 Troubleshooting

### Lỗi: "Invalid username or password"
- Kiểm tra username/password đúng chưa
- Kiểm tra user có status ACTIVE không
- Kiểm tra password hash trong database

### Lỗi: "JWT expired"
- Sử dụng refresh token để lấy access token mới
- Hoặc đăng nhập lại

### Lỗi: "Access Denied"
- Kiểm tra user có đủ permissions không
- Kiểm tra role của user

### Lỗi: "CORS error"
- Kiểm tra CORS configuration trong SecurityConfig
- Đảm bảo frontend URL được thêm vào allowed-origins

## 📚 References

- [Spring Security Documentation](https://docs.spring.io/spring-security/reference/index.html)
- [JWT.io](https://jwt.io/) - JWT token decoder
- [BCrypt Online](https://bcrypt-generator.com/) - Generate BCrypt hashes
