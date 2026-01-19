# API Documentation - SmartRent

## 1. Tổng Quan

API được thiết kế theo chuẩn **RESTful** với các nguyên tắc:
- Resource-based URLs
- HTTP methods chuẩn (GET, POST, PUT, DELETE, PATCH)
- JSON request/response
- Status codes chuẩn HTTP
- Pagination cho list endpoints
- Filtering và sorting

## 2. Base URL

```
Development: http://localhost:8080/api
Production: https://api.smartrent.com/api
```

## 3. Authentication

### 3.1 JWT Token

Tất cả API (trừ auth endpoints) yêu cầu JWT token trong header:

```
Authorization: Bearer <token>
```

### 3.2 Token Claims

```json
{
  "userId": 1,
  "tenantId": 1,
  "username": "admin",
  "roles": ["TENANT_ADMIN"],
  "permissions": ["READ_ROOMS", "WRITE_ROOMS", ...],
  "exp": 1234567890
}
```

## 4. Response Format

### 4.1 Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### 4.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

### 4.3 Pagination Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 5. API Endpoints

### 5.1 Authentication APIs

#### POST /api/auth/login
Đăng nhập

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "roles": ["TENANT_ADMIN"]
    }
  }
}
```

#### POST /api/auth/register
Đăng ký (cho marketing website)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "User Name",
  "phone": "0123456789",
  "companyName": "Company Name"
}
```

#### POST /api/auth/refresh
Refresh token

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /api/auth/logout
Đăng xuất

#### POST /api/auth/forgot-password
Quên mật khẩu

**Request:**
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password
Đặt lại mật khẩu

**Request:**
```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

### 5.2 Tenant Management APIs

#### GET /api/tenants/me
Lấy thông tin tenant hiện tại

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "ABC Company",
    "email": "contact@abc.com",
    "phone": "0123456789",
    "address": "123 Main St",
    "status": "ACTIVE",
    "subscription": {
      "plan": "Premium",
      "endDate": "2024-12-31"
    }
  }
}
```

#### PUT /api/tenants/me
Cập nhật thông tin tenant

### 5.3 User Management APIs

#### GET /api/users
Lấy danh sách users (có phân trang)

**Query Parameters:**
- `page`: Số trang (default: 1)
- `size`: Số items/trang (default: 20)
- `role`: Lọc theo role
- `status`: Lọc theo status
- `search`: Tìm kiếm theo tên/email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com",
      "fullName": "User One",
      "role": "TENANT_MANAGER",
      "status": "ACTIVE"
    }
  ],
  "pagination": { ... }
}
```

#### GET /api/users/{id}
Lấy thông tin user

#### POST /api/users
Tạo user mới

**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User",
  "phone": "0123456789",
  "role": "TENANT_STAFF"
}
```

#### PUT /api/users/{id}
Cập nhật user

#### DELETE /api/users/{id}
Xóa user

### 5.4 Building Management APIs

#### GET /api/buildings
Lấy danh sách buildings

**Query Parameters:**
- `page`, `size`
- `search`: Tìm kiếm theo tên
- `status`: Lọc theo status

#### GET /api/buildings/{id}
Lấy thông tin building

#### POST /api/buildings
Tạo building mới

**Request:**
```json
{
  "name": "Khu trọ ABC",
  "address": "123 Main St",
  "description": "Khu trọ cao cấp",
  "totalFloors": 5,
  "totalRooms": 50
}
```

#### PUT /api/buildings/{id}
Cập nhật building

#### DELETE /api/buildings/{id}
Xóa building

### 5.5 Room Management APIs

#### GET /api/rooms
Lấy danh sách rooms

**Query Parameters:**
- `page`, `size`
- `buildingId`: Lọc theo building
- `status`: Lọc theo status (AVAILABLE, OCCUPIED, MAINTENANCE)
- `minPrice`, `maxPrice`: Lọc theo giá
- `search`: Tìm kiếm theo số phòng

#### GET /api/rooms/{id}
Lấy thông tin room

#### POST /api/rooms
Tạo room mới

**Request:**
```json
{
  "buildingId": 1,
  "roomNumber": "101",
  "floor": 1,
  "area": 25.5,
  "price": 2000000,
  "deposit": 4000000,
  "amenities": ["wifi", "air_conditioner"],
  "description": "Phòng đẹp, thoáng mát"
}
```

#### PUT /api/rooms/{id}
Cập nhật room

#### PATCH /api/rooms/{id}/status
Cập nhật status room

**Request:**
```json
{
  "status": "MAINTENANCE"
}
```

#### DELETE /api/rooms/{id}
Xóa room

### 5.6 Tenant Info (Người Thuê) APIs

#### GET /api/tenant-info
Lấy danh sách người thuê

**Query Parameters:**
- `page`, `size`
- `search`: Tìm kiếm theo tên/phone
- `status`: Lọc theo status

#### GET /api/tenant-info/{id}
Lấy thông tin người thuê

#### POST /api/tenant-info
Tạo người thuê mới

**Request:**
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0123456789",
  "idCard": "001234567890",
  "idCardIssueDate": "2020-01-01",
  "idCardIssuePlace": "Công an TP.HCM",
  "permanentAddress": "123 Đường ABC, Quận 1, TP.HCM",
  "emergencyContactName": "Nguyễn Văn B",
  "emergencyContactPhone": "0987654321"
}
```

#### PUT /api/tenant-info/{id}
Cập nhật thông tin người thuê

### 5.7 Contract Management APIs

#### GET /api/contracts
Lấy danh sách contracts

**Query Parameters:**
- `page`, `size`
- `roomId`: Lọc theo room
- `tenantInfoId`: Lọc theo người thuê
- `status`: Lọc theo status
- `startDate`, `endDate`: Lọc theo ngày

#### GET /api/contracts/{id}
Lấy thông tin contract

#### POST /api/contracts
Tạo contract mới

**Request:**
```json
{
  "roomId": 1,
  "tenantInfoId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "monthlyRent": 2000000,
  "deposit": 4000000,
  "terms": "Điều khoản hợp đồng..."
}
```

#### PUT /api/contracts/{id}
Cập nhật contract

#### POST /api/contracts/{id}/renew
Gia hạn contract

**Request:**
```json
{
  "newEndDate": "2025-12-31"
}
```

#### POST /api/contracts/{id}/terminate
Thanh lý contract

**Request:**
```json
{
  "terminationDate": "2024-06-30",
  "reason": "Hết hạn hợp đồng"
}
```

#### GET /api/contracts/{id}/pdf
Xuất PDF contract

### 5.8 Invoice Management APIs

#### GET /api/invoices
Lấy danh sách invoices

**Query Parameters:**
- `page`, `size`
- `contractId`: Lọc theo contract
- `status`: Lọc theo status
- `fromDate`, `toDate`: Lọc theo ngày
- `overdue`: Chỉ lấy hóa đơn quá hạn

#### GET /api/invoices/{id}
Lấy thông tin invoice

#### POST /api/invoices
Tạo invoice thủ công

**Request:**
```json
{
  "contractId": 1,
  "invoiceDate": "2024-01-01",
  "dueDate": "2024-01-10",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "items": [
    {
      "itemType": "RENT",
      "description": "Tiền thuê tháng 1/2024",
      "amount": 2000000
    },
    {
      "itemType": "ELECTRICITY",
      "description": "Tiền điện",
      "quantity": 100,
      "unitPrice": 3000,
      "amount": 300000
    }
  ]
}
```

#### POST /api/invoices/generate-monthly
Tạo hóa đơn hàng tháng tự động

**Request:**
```json
{
  "month": 1,
  "year": 2024
}
```

#### POST /api/invoices/{id}/pay
Thanh toán invoice

**Request:**
```json
{
  "amount": 2300000,
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "REF123456",
  "paymentDate": "2024-01-05"
}
```

#### GET /api/invoices/{id}/pdf
Xuất PDF invoice

### 5.9 Payment APIs

#### GET /api/payments
Lấy danh sách payments

**Query Parameters:**
- `page`, `size`
- `invoiceId`: Lọc theo invoice
- `fromDate`, `toDate`: Lọc theo ngày
- `paymentMethod`: Lọc theo phương thức

#### GET /api/payments/{id}
Lấy thông tin payment

#### POST /api/payments
Tạo payment

### 5.10 Utility Management APIs

#### GET /api/utility-readings
Lấy danh sách chỉ số điện nước

**Query Parameters:**
- `page`, `size`
- `roomId`: Lọc theo room
- `serviceId`: Lọc theo service (điện/nước)
- `fromDate`, `toDate`: Lọc theo ngày

#### GET /api/utility-readings/{id}
Lấy thông tin chỉ số

#### POST /api/utility-readings
Nhập chỉ số mới

**Request:**
```json
{
  "roomId": 1,
  "serviceId": 1,
  "readingDate": "2024-01-31",
  "currentReading": 150.5,
  "unitPrice": 3000
}
```

#### PUT /api/utility-readings/{id}
Cập nhật chỉ số

### 5.11 Service Management APIs

#### GET /api/services
Lấy danh sách services

#### GET /api/services/{id}
Lấy thông tin service

#### POST /api/services
Tạo service mới

**Request:**
```json
{
  "name": "Điện",
  "type": "ELECTRICITY",
  "unit": "kWh",
  "price": 3000,
  "calculationMethod": "PER_UNIT"
}
```

#### PUT /api/services/{id}
Cập nhật service

### 5.12 Debt Management APIs

#### GET /api/debts
Lấy danh sách công nợ

**Query Parameters:**
- `page`, `size`
- `contractId`: Lọc theo contract
- `status`: Lọc theo status
- `priority`: Lọc theo priority
- `overdue`: Chỉ lấy công nợ quá hạn

#### GET /api/debts/{id}
Lấy thông tin công nợ

#### POST /api/debts/{id}/remind
Gửi nhắc nợ

### 5.13 Maintenance APIs

#### GET /api/maintenance-requests
Lấy danh sách yêu cầu bảo trì

**Query Parameters:**
- `page`, `size`
- `roomId`: Lọc theo room
- `status`: Lọc theo status
- `priority`: Lọc theo priority

#### GET /api/maintenance-requests/{id}
Lấy thông tin yêu cầu

#### POST /api/maintenance-requests
Tạo yêu cầu bảo trì

**Request:**
```json
{
  "roomId": 1,
  "title": "Sửa chữa điều hòa",
  "description": "Điều hòa không hoạt động",
  "priority": "HIGH"
}
```

#### PUT /api/maintenance-requests/{id}
Cập nhật yêu cầu

#### PATCH /api/maintenance-requests/{id}/status
Cập nhật status

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "assignedTo": 2
}
```

### 5.14 Violation APIs

#### GET /api/violations
Lấy danh sách vi phạm

#### GET /api/violations/{id}
Lấy thông tin vi phạm

#### POST /api/violations
Tạo vi phạm mới

**Request:**
```json
{
  "contractId": 1,
  "violationType": "NOISE",
  "description": "Gây ồn sau 22h",
  "penaltyAmount": 500000
}
```

### 5.15 Notification APIs

#### GET /api/notifications
Lấy danh sách notifications

**Query Parameters:**
- `page`, `size`
- `type`: Lọc theo type
- `read`: Lọc theo đã đọc/chưa đọc

#### GET /api/notifications/{id}
Lấy thông tin notification

#### PATCH /api/notifications/{id}/read
Đánh dấu đã đọc

#### POST /api/notifications/send
Gửi notification

**Request:**
```json
{
  "userId": 1,
  "type": "EMAIL",
  "subject": "Hóa đơn mới",
  "content": "Bạn có hóa đơn mới cần thanh toán"
}
```

### 5.16 Report APIs

#### GET /api/reports/revenue
Báo cáo doanh thu

**Query Parameters:**
- `fromDate`, `toDate`: Kỳ báo cáo
- `groupBy`: DAY, MONTH, YEAR

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 50000000,
    "byMonth": [
      {
        "month": "2024-01",
        "revenue": 25000000
      }
    ]
  }
}
```

#### GET /api/reports/debt
Báo cáo công nợ

#### GET /api/reports/occupancy
Báo cáo tỷ lệ lấp phòng

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRooms": 100,
    "occupiedRooms": 85,
    "availableRooms": 10,
    "maintenanceRooms": 5,
    "occupancyRate": 85.0
  }
}
```

## 6. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Chưa đăng nhập hoặc token hết hạn |
| `FORBIDDEN` | 403 | Không có quyền truy cập |
| `NOT_FOUND` | 404 | Resource không tồn tại |
| `VALIDATION_ERROR` | 400 | Dữ liệu không hợp lệ |
| `DUPLICATE_ENTRY` | 409 | Dữ liệu trùng lặp |
| `INTERNAL_ERROR` | 500 | Lỗi server |

## 7. Rate Limiting

- **Public APIs**: 100 requests/minute
- **Authenticated APIs**: 1000 requests/minute
- **Admin APIs**: 5000 requests/minute

## 8. API Versioning

API versioning qua URL:
- `/api/v1/...` (hiện tại)
- `/api/v2/...` (tương lai)
