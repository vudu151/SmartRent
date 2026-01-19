# Tóm Tắt Tài Liệu - SmartRent

## Tổng Quan

Dự án SmartRent là một hệ thống SaaS quản lý nhà trọ được phát triển với:
- **Backend**: Spring Boot (Java)
- **Frontend**: React (TypeScript)
- **Database**: PostgreSQL

## Cấu Trúc Tài Liệu

### 1. [README.md](../README.md)
Tài liệu tổng quan dự án, bao gồm:
- Giới thiệu hệ thống
- Kiến trúc 4 lớp
- Công nghệ sử dụng
- Tính năng chính
- Lộ trình triển khai
- Hướng dẫn bắt đầu

### 2. [ARCHITECTURE.md](ARCHITECTURE.md)
Tài liệu kiến trúc hệ thống, bao gồm:
- Tổng quan kiến trúc
- Mô hình Multi-Tenant
- Cấu trúc Backend (Spring Boot)
- Cấu trúc Frontend (React)
- Security Architecture
- Integration Points
- Scalability Considerations

### 3. [DATABASE.md](DATABASE.md)
Thiết kế database, bao gồm:
- ERD (Entity Relationship Diagram)
- Schema chi tiết cho tất cả các bảng
- Constraints & Rules
- Indexing Strategy
- Migration Strategy
- Backup & Recovery

### 4. [API.md](API.md)
Tài liệu API specification, bao gồm:
- Authentication APIs
- Tenant Management APIs
- User Management APIs
- Building & Room Management APIs
- Contract Management APIs
- Invoice & Payment APIs
- Utility Management APIs
- Report APIs
- Error Codes
- Rate Limiting

### 5. [DEVELOPMENT.md](DEVELOPMENT.md)
Hướng dẫn phát triển, bao gồm:
- Yêu cầu hệ thống
- Setup môi trường
- Cấu trúc dự án
- Coding Standards
- Git Workflow
- Testing
- Database Migrations
- Debugging
- Deployment

## Các Tính Năng Chính

### Website Giới Thiệu & Bán Dịch Vụ
- Marketing website
- Đăng ký/đăng nhập
- Đăng ký gói dịch vụ và thanh toán

### Hệ Thống SaaS Quản Lý Nhà Trọ
1. Quản lý tenant và users
2. Quản lý cơ sở vật chất (buildings, rooms)
3. Quản lý người thuê
4. Quản lý hợp đồng
5. Quản lý dịch vụ & giá
6. Quản lý điện nước
7. Quản lý thu tiền & hóa đơn
8. Quản lý công nợ
9. Quản lý bảo trì
10. Quản lý vi phạm
11. Thông báo (Email, SMS, Zalo)
12. Báo cáo

### Cổng Người Thuê
- Xem hóa đơn và hợp đồng
- Thanh toán online
- Gửi yêu cầu sửa chữa

### Hệ Thống Admin
- Quản lý khách hàng SaaS
- Quản lý gói dịch vụ
- Doanh thu và thanh toán

## Kiến Trúc Multi-Tenant

Hệ thống sử dụng mô hình **Shared Database, Shared Schema**:
- Tất cả tenant dùng chung database
- Phân biệt dữ liệu bằng `tenant_id`
- Phân quyền RBAC (Role-Based Access Control)
- Row-level security với tenant isolation

## Database Schema

Các bảng chính:
- `tenants` - Thông tin tenant (chủ trọ)
- `users` - Người dùng hệ thống
- `buildings` - Tòa nhà/khu trọ
- `rooms` - Phòng trọ
- `contracts` - Hợp đồng thuê
- `invoices` - Hóa đơn
- `payments` - Thanh toán
- `utility_readings` - Chỉ số điện nước
- `services` - Dịch vụ
- `debts` - Công nợ
- `maintenance_requests` - Yêu cầu bảo trì
- `violations` - Vi phạm
- `notifications` - Thông báo

## API Endpoints

Hệ thống cung cấp RESTful API với:
- JWT Authentication
- Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Pagination cho list endpoints
- Filtering và sorting
- Error handling chuẩn

## Lộ Trình Triển Khai

### Giai Đoạn 1: MVP
- Quản lý cơ bản: phòng, người thuê, hợp đồng
- Quản lý hóa đơn và thanh toán
- Quản lý điện nước cơ bản
- Báo cáo cơ bản

### Giai Đoạn 2: Nâng Cao
- Thanh toán online
- Portal người thuê đầy đủ
- Tích hợp thông báo

### Giai Đoạn 3: Mở Rộng
- Ứng dụng mobile
- AI phân tích
- Dashboard analytics nâng cao

## Bắt Đầu Phát Triển

1. Đọc [README.md](../README.md) để hiểu tổng quan
2. Xem [DEVELOPMENT.md](DEVELOPMENT.md) để setup môi trường
3. Tham khảo [ARCHITECTURE.md](ARCHITECTURE.md) để hiểu kiến trúc
4. Xem [DATABASE.md](DATABASE.md) để hiểu database schema
5. Tham khảo [API.md](API.md) khi phát triển API

## Lưu Ý

- Tài liệu sẽ được cập nhật thường xuyên
- Mọi thay đổi về kiến trúc hoặc API cần cập nhật tài liệu tương ứng
- Code comments và documentation là bắt buộc cho mọi public API

---

**Cập nhật lần cuối**: 2024
