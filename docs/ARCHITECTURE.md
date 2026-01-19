# Kiến Trúc Hệ Thống SmartRent

## 1. Tổng Quan Kiến Trúc

SmartRent được xây dựng theo kiến trúc **Microservices-ready Monolith** với khả năng mở rộng thành microservices khi cần thiết.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
├─────────────────────────────────────────────────────────────┤
│  Web App (React)  │  Tenant Portal  │  Marketing Website   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
├─────────────────────────────────────────────────────────────┤
│         Spring Boot REST API + Security                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Tenant Service │ Contract Service │ Invoice Service       │
│  Payment Service │ Notification Service │ Report Service    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
├─────────────────────────────────────────────────────────────┤
│         JPA/Hibernate + PostgreSQL                          │
└─────────────────────────────────────────────────────────────┘
```

## 2. Kiến Trúc Multi-Tenant

### 2.1 Mô Hình: Shared Database, Shared Schema

- **Ưu điểm**: 
  - Dễ bảo trì và nâng cấp
  - Chi phí thấp
  - Hiệu suất tốt với số lượng tenant vừa phải

- **Cách triển khai**:
  - Tất cả bảng có cột `tenant_id`
  - Row-level filtering trong mọi query
  - Middleware tự động inject `tenant_id` vào context

### 2.2 Tenant Isolation

```java
// Ví dụ: Tự động filter theo tenant_id
@PreAuthorize("hasTenantAccess(#tenantId)")
public List<Room> getRooms(Long tenantId) {
    return roomRepository.findByTenantId(tenantId);
}
```

### 2.3 Phân Quyền RBAC

**Roles**:
- `SUPER_ADMIN` - Quản trị hệ thống
- `TENANT_ADMIN` - Quản trị tenant
- `TENANT_MANAGER` - Quản lý nhà trọ
- `TENANT_STAFF` - Nhân viên
- `TENANT` - Người thuê trọ

**Permissions**:
- `READ_ROOMS`, `WRITE_ROOMS`
- `READ_CONTRACTS`, `WRITE_CONTRACTS`
- `READ_INVOICES`, `WRITE_INVOICES`
- `READ_REPORTS`, `WRITE_REPORTS`
- v.v.

## 3. Cấu Trúc Backend (Spring Boot)

### 3.1 Package Structure

```
com.smartrent
├── config/              # Configuration classes
│   ├── SecurityConfig
│   ├── JpaConfig
│   └── WebConfig
├── domain/              # Entity classes
│   ├── tenant/
│   ├── building/
│   ├── contract/
│   └── invoice/
├── repository/          # JPA Repositories
├── service/             # Business logic
│   ├── TenantService
│   ├── ContractService
│   └── InvoiceService
├── controller/          # REST Controllers
│   ├── TenantController
│   ├── ContractController
│   └── InvoiceController
├── dto/                 # Data Transfer Objects
├── mapper/              # Entity-DTO mappers
├── security/            # Security components
│   ├── JwtTokenProvider
│   └── TenantContext
└── exception/           # Exception handling
```

### 3.2 Các Layer Chính

#### Controller Layer
- Xử lý HTTP requests/responses
- Validation input
- Authentication & Authorization
- Exception handling

#### Service Layer
- Business logic
- Transaction management
- Cross-cutting concerns

#### Repository Layer
- Data access
- Query optimization
- Tenant filtering

## 4. Cấu Trúc Frontend (React)

### 4.1 Folder Structure

```
src/
├── components/          # Reusable components
│   ├── common/
│   ├── forms/
│   └── tables/
├── pages/              # Page components
│   ├── dashboard/
│   ├── rooms/
│   ├── contracts/
│   └── invoices/
├── services/           # API services
│   ├── api/
│   └── auth/
├── store/              # State management
│   ├── slices/
│   └── store.ts
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── types/              # TypeScript types
└── constants/          # Constants
```

### 4.2 State Management

Sử dụng **Redux Toolkit** hoặc **Zustand**:
- Global state: Authentication, Tenant info
- Feature state: Rooms, Contracts, Invoices
- UI state: Modals, Forms

### 4.3 Routing

- **Marketing Website**: `/` (public routes)
- **SaaS Dashboard**: `/app/*` (protected routes)
- **Tenant Portal**: `/portal/*` (protected routes)
- **Admin Panel**: `/admin/*` (admin only)

## 5. Security Architecture

### 5.1 Authentication Flow

```
1. User login → POST /api/auth/login
2. Server validates credentials
3. Generate JWT token với claims:
   - userId
   - tenantId
   - roles
   - permissions
4. Client stores token (httpOnly cookie hoặc localStorage)
5. Client includes token in Authorization header
6. Server validates token và extract tenant context
```

### 5.2 Authorization

- **Method-level security**: `@PreAuthorize`
- **Tenant isolation**: Tự động filter theo tenant_id
- **Role-based access**: Kiểm tra roles và permissions

### 5.3 Data Security

- **Encryption**: Mã hóa dữ liệu nhạy cảm (CCCD, số điện thoại)
- **HTTPS**: Bắt buộc trong production
- **SQL Injection**: Sử dụng JPA/Hibernate (parameterized queries)
- **XSS Protection**: Input validation và sanitization

## 6. Integration Points

### 6.1 Payment Gateway
- **VNPay**: Thanh toán online
- **Momo**: Ví điện tử
- **Banking**: Chuyển khoản ngân hàng

### 6.2 Notification Services
- **Email**: SMTP/SendGrid
- **SMS**: Twilio/Viettel
- **Zalo**: Zalo OA API

### 6.3 File Storage
- **Local Storage**: Development
- **AWS S3 / MinIO**: Production
- **CDN**: Static assets

## 7. Scalability Considerations

### 7.1 Database
- **Indexing**: Tối ưu indexes cho tenant_id và các query thường dùng
- **Partitioning**: Có thể partition theo tenant_id nếu cần
- **Read Replicas**: Cho reporting queries

### 7.2 Caching
- **Redis**: Cache tenant info, user sessions
- **Application Cache**: Cache static data (plans, services)

### 7.3 Background Jobs
- **Scheduled Tasks**: Tạo hóa đơn hàng tháng, nhắc nợ
- **Async Processing**: Email/SMS notifications
- **Queue**: RabbitMQ / Redis Queue

## 8. Monitoring & Logging

### 8.1 Logging
- **Structured Logging**: JSON format
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Tenant Context**: Mọi log đều có tenant_id

### 8.2 Monitoring
- **Application Metrics**: Spring Actuator
- **Database Metrics**: PostgreSQL monitoring
- **Error Tracking**: Sentry / ELK Stack

## 9. Deployment Architecture

### 9.1 Development
```
Frontend (Vite Dev Server) → Backend (Spring Boot) → PostgreSQL
```

### 9.2 Production
```
CDN → Load Balancer → Frontend (Nginx) → API Gateway → Backend (Spring Boot) → PostgreSQL (Master + Replicas)
```

## 10. Future Enhancements

- **Microservices**: Tách thành services riêng khi scale
- **Event-Driven**: Sử dụng event sourcing cho audit trail
- **GraphQL**: Thêm GraphQL API bên cạnh REST
- **Real-time**: WebSocket cho notifications real-time
