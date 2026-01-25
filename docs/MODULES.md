# Thống Kê Các Module Chính - SmartRent

Tài liệu này thống kê các module và chức năng chính của hệ thống SmartRent để phát triển từng bước.

## 📋 Tổng Quan

SmartRent là hệ thống **Multi-Tenant SaaS** quản lý nhà trọ với các module chính:

---

## 🏗️ PHẦN 1: CORE INFRASTRUCTURE (Nền tảng)

### 1.1 Authentication & Authorization
**Mức độ ưu tiên**: ⭐⭐⭐⭐⭐ (Cao nhất)

**Chức năng**:
- [ ] JWT Authentication (Login/Logout)
- [ ] Token Refresh
- [ ] Password Reset
- [ ] Role-Based Access Control (RBAC)
- [ ] Permission Management
- [ ] Tenant Context Isolation

**Database Tables**:
- `users` - Người dùng hệ thống
- `roles` - Vai trò
- `permissions` - Quyền
- `role_permissions` - Mapping role-permission
- `user_roles` - Mapping user-role

**API Endpoints**:
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

**Files cần tạo**:
- `domain/User.java`
- `domain/Role.java`
- `domain/Permission.java`
- `repository/UserRepository.java`
- `service/AuthService.java`
- `controller/AuthController.java`
- `security/JwtTokenProvider.java`
- `security/JwtAuthenticationFilter.java`

---

### 1.2 Tenant Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐⭐ (Cao nhất)

**Chức năng**:
- [ ] CRUD Tenant (chủ trọ)
- [ ] Tenant Subscription Management
- [ ] Tenant Status Management
- [ ] Tenant Settings

**Database Tables**:
- `tenants` - Thông tin tenant (chủ trọ)
- `plans` - Gói dịch vụ SaaS
- `subscriptions` - Đăng ký dịch vụ

**API Endpoints**:
- `GET /api/tenants` - Danh sách tenant
- `GET /api/tenants/{id}` - Chi tiết tenant
- `POST /api/tenants` - Tạo tenant
- `PUT /api/tenants/{id}` - Cập nhật tenant
- `DELETE /api/tenants/{id}` - Xóa tenant
- `GET /api/tenants/{id}/subscription` - Thông tin subscription

**Files cần tạo**:
- `domain/Tenant.java`
- `domain/Plan.java`
- `domain/Subscription.java`
- `repository/TenantRepository.java`
- `service/TenantService.java`
- `controller/TenantController.java`
- `dto/TenantDTO.java`

---

## 🏢 PHẦN 2: PROPERTY MANAGEMENT (Quản lý tài sản)

### 2.1 Building Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐

**Chức năng**:
- [ ] CRUD Building (Tòa nhà/Khu trọ)
- [ ] Building Statistics
- [ ] Building Status Management

**Database Tables**:
- `buildings` - Tòa nhà/khu trọ

**API Endpoints**:
- `GET /api/buildings` - Danh sách tòa nhà
- `GET /api/buildings/{id}` - Chi tiết tòa nhà
- `POST /api/buildings` - Tạo tòa nhà
- `PUT /api/buildings/{id}` - Cập nhật tòa nhà
- `DELETE /api/buildings/{id}` - Xóa tòa nhà
- `GET /api/buildings/{id}/statistics` - Thống kê tòa nhà

**Files cần tạo**:
- `domain/Building.java`
- `repository/BuildingRepository.java`
- `service/BuildingService.java`
- `controller/BuildingController.java`
- `dto/BuildingDTO.java`

---

### 2.2 Room Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐

**Chức năng**:
- [ ] CRUD Room (Phòng trọ)
- [ ] Room Status Management (AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED)
- [ ] Room Search & Filter
- [ ] Room Amenities Management

**Database Tables**:
- `rooms` - Phòng trọ

**API Endpoints**:
- `GET /api/rooms` - Danh sách phòng (có filter, search, pagination)
- `GET /api/rooms/{id}` - Chi tiết phòng
- `POST /api/rooms` - Tạo phòng
- `PUT /api/rooms/{id}` - Cập nhật phòng
- `DELETE /api/rooms/{id}` - Xóa phòng
- `PATCH /api/rooms/{id}/status` - Cập nhật trạng thái phòng
- `GET /api/buildings/{buildingId}/rooms` - Phòng theo tòa nhà

**Files cần tạo**:
- `domain/Room.java`
- `repository/RoomRepository.java`
- `service/RoomService.java`
- `controller/RoomController.java`
- `dto/RoomDTO.java`
- `dto/RoomSearchDTO.java`

---

## 👥 PHẦN 3: TENANT INFO MANAGEMENT (Quản lý người thuê)

### 3.1 Tenant Info Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐

**Chức năng**:
- [ ] CRUD Tenant Info (Thông tin người thuê trọ)
- [ ] ID Card Management
- [ ] Emergency Contact Management
- [ ] Tenant History

**Database Tables**:
- `tenants_info` - Thông tin người thuê trọ

**API Endpoints**:
- `GET /api/tenants-info` - Danh sách người thuê
- `GET /api/tenants-info/{id}` - Chi tiết người thuê
- `POST /api/tenants-info` - Tạo người thuê
- `PUT /api/tenants-info/{id}` - Cập nhật người thuê
- `DELETE /api/tenants-info/{id}` - Xóa người thuê
- `GET /api/tenants-info/{id}/history` - Lịch sử người thuê

**Files cần tạo**:
- `domain/TenantInfo.java`
- `repository/TenantInfoRepository.java`
- `service/TenantInfoService.java`
- `controller/TenantInfoController.java`
- `dto/TenantInfoDTO.java`

---

## 📄 PHẦN 4: CONTRACT MANAGEMENT (Quản lý hợp đồng)

### 4.1 Contract Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐⭐

**Chức năng**:
- [ ] CRUD Contract (Hợp đồng thuê)
- [ ] Contract Status Management (ACTIVE, EXPIRED, TERMINATED, RENEWED)
- [ ] Contract Renewal
- [ ] Contract Termination
- [ ] Contract Number Generation

**Database Tables**:
- `contracts` - Hợp đồng thuê trọ

**API Endpoints**:
- `GET /api/contracts` - Danh sách hợp đồng
- `GET /api/contracts/{id}` - Chi tiết hợp đồng
- `POST /api/contracts` - Tạo hợp đồng
- `PUT /api/contracts/{id}` - Cập nhật hợp đồng
- `DELETE /api/contracts/{id}` - Xóa hợp đồng
- `POST /api/contracts/{id}/renew` - Gia hạn hợp đồng
- `POST /api/contracts/{id}/terminate` - Chấm dứt hợp đồng
- `GET /api/rooms/{roomId}/contracts` - Hợp đồng theo phòng
- `GET /api/tenants-info/{tenantInfoId}/contracts` - Hợp đồng theo người thuê

**Files cần tạo**:
- `domain/Contract.java`
- `repository/ContractRepository.java`
- `service/ContractService.java`
- `controller/ContractController.java`
- `dto/ContractDTO.java`
- `service/ContractNumberGenerator.java`

---

## 💰 PHẦN 5: FINANCIAL MANAGEMENT (Quản lý tài chính)

### 5.1 Service & Pricing Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐

**Chức năng**:
- [ ] CRUD Service (Dịch vụ: điện, nước, wifi, v.v.)
- [ ] Service Pricing Management
- [ ] Service Type Management

**Database Tables**:
- `services` - Dịch vụ

**API Endpoints**:
- `GET /api/services` - Danh sách dịch vụ
- `GET /api/services/{id}` - Chi tiết dịch vụ
- `POST /api/services` - Tạo dịch vụ
- `PUT /api/services/{id}` - Cập nhật dịch vụ
- `DELETE /api/services/{id}` - Xóa dịch vụ

**Files cần tạo**:
- `domain/Service.java`
- `repository/ServiceRepository.java`
- `service/ServiceService.java`
- `controller/ServiceController.java`
- `dto/ServiceDTO.java`

---

### 5.2 Utility Reading Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐

**Chức năng**:
- [ ] CRUD Utility Reading (Chỉ số điện nước)
- [ ] Consumption Calculation
- [ ] Utility Reading History
- [ ] Bulk Import Utility Readings

**Database Tables**:
- `utility_readings` - Chỉ số điện nước

**API Endpoints**:
- `GET /api/utility-readings` - Danh sách chỉ số
- `GET /api/utility-readings/{id}` - Chi tiết chỉ số
- `POST /api/utility-readings` - Tạo chỉ số
- `PUT /api/utility-readings/{id}` - Cập nhật chỉ số
- `DELETE /api/utility-readings/{id}` - Xóa chỉ số
- `GET /api/rooms/{roomId}/utility-readings` - Chỉ số theo phòng
- `POST /api/utility-readings/bulk` - Import hàng loạt

**Files cần tạo**:
- `domain/UtilityReading.java`
- `repository/UtilityReadingRepository.java`
- `service/UtilityReadingService.java`
- `controller/UtilityReadingController.java`
- `dto/UtilityReadingDTO.java`

---

### 5.3 Invoice Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐⭐

**Chức năng**:
- [ ] CRUD Invoice (Hóa đơn)
- [ ] Invoice Generation (tự động từ contract + utility)
- [ ] Invoice Status Management (PENDING, PAID, PARTIAL, OVERDUE, CANCELLED)
- [ ] Invoice Items Management
- [ ] Invoice Number Generation
- [ ] Invoice PDF Export

**Database Tables**:
- `invoices` - Hóa đơn
- `invoice_items` - Chi tiết hóa đơn

**API Endpoints**:
- `GET /api/invoices` - Danh sách hóa đơn
- `GET /api/invoices/{id}` - Chi tiết hóa đơn
- `POST /api/invoices` - Tạo hóa đơn
- `PUT /api/invoices/{id}` - Cập nhật hóa đơn
- `DELETE /api/invoices/{id}` - Xóa hóa đơn
- `POST /api/invoices/generate` - Tạo hóa đơn tự động
- `GET /api/invoices/{id}/pdf` - Export PDF
- `GET /api/contracts/{contractId}/invoices` - Hóa đơn theo hợp đồng

**Files cần tạo**:
- `domain/Invoice.java`
- `domain/InvoiceItem.java`
- `repository/InvoiceRepository.java`
- `service/InvoiceService.java`
- `service/InvoiceGeneratorService.java`
- `controller/InvoiceController.java`
- `dto/InvoiceDTO.java`
- `dto/InvoiceItemDTO.java`

---

### 5.4 Payment Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐⭐

**Chức năng**:
- [ ] CRUD Payment (Thanh toán)
- [ ] Payment Methods (CASH, BANK_TRANSFER, VNPAY, MOMO)
- [ ] Payment Status Management
- [ ] Payment Reference Management
- [ ] Payment History

**Database Tables**:
- `payments` - Thanh toán

**API Endpoints**:
- `GET /api/payments` - Danh sách thanh toán
- `GET /api/payments/{id}` - Chi tiết thanh toán
- `POST /api/payments` - Tạo thanh toán
- `PUT /api/payments/{id}` - Cập nhật thanh toán
- `DELETE /api/payments/{id}` - Xóa thanh toán
- `GET /api/invoices/{invoiceId}/payments` - Thanh toán theo hóa đơn
- `POST /api/payments/{id}/refund` - Hoàn tiền

**Files cần tạo**:
- `domain/Payment.java`
- `repository/PaymentRepository.java`
- `service/PaymentService.java`
- `controller/PaymentController.java`
- `dto/PaymentDTO.java`

---

### 5.5 Debt Management
**Mức độ ưu tiên**: ⭐⭐⭐⭐

**Chức năng**:
- [ ] CRUD Debt (Công nợ)
- [ ] Debt Calculation (tự động từ invoice)
- [ ] Debt Status Management (PENDING, PARTIAL, PAID, OVERDUE)
- [ ] Debt Priority Management
- [ ] Debt Reminder

**Database Tables**:
- `debts` - Công nợ

**API Endpoints**:
- `GET /api/debts` - Danh sách công nợ
- `GET /api/debts/{id}` - Chi tiết công nợ
- `POST /api/debts` - Tạo công nợ
- `PUT /api/debts/{id}` - Cập nhật công nợ
- `DELETE /api/debts/{id}` - Xóa công nợ
- `GET /api/contracts/{contractId}/debts` - Công nợ theo hợp đồng
- `POST /api/debts/{id}/remind` - Gửi nhắc nhở

**Files cần tạo**:
- `domain/Debt.java`
- `repository/DebtRepository.java`
- `service/DebtService.java`
- `controller/DebtController.java`
- `dto/DebtDTO.java`

---

## 🔧 PHẦN 6: MAINTENANCE MANAGEMENT (Quản lý bảo trì)

### 6.1 Maintenance Request Management
**Mức độ ưu tiên**: ⭐⭐⭐

**Chức năng**:
- [ ] CRUD Maintenance Request (Yêu cầu bảo trì)
- [ ] Maintenance Status Management (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- [ ] Maintenance Priority Management
- [ ] Maintenance Assignment
- [ ] Cost Tracking

**Database Tables**:
- `maintenance_requests` - Yêu cầu bảo trì

**API Endpoints**:
- `GET /api/maintenance-requests` - Danh sách yêu cầu
- `GET /api/maintenance-requests/{id}` - Chi tiết yêu cầu
- `POST /api/maintenance-requests` - Tạo yêu cầu
- `PUT /api/maintenance-requests/{id}` - Cập nhật yêu cầu
- `DELETE /api/maintenance-requests/{id}` - Xóa yêu cầu
- `PATCH /api/maintenance-requests/{id}/assign` - Gán người xử lý
- `PATCH /api/maintenance-requests/{id}/complete` - Hoàn thành

**Files cần tạo**:
- `domain/MaintenanceRequest.java`
- `repository/MaintenanceRequestRepository.java`
- `service/MaintenanceRequestService.java`
- `controller/MaintenanceRequestController.java`
- `dto/MaintenanceRequestDTO.java`

---

## ⚠️ PHẦN 7: VIOLATION MANAGEMENT (Quản lý vi phạm)

### 7.1 Violation Management
**Mức độ ưu tiên**: ⭐⭐⭐

**Chức năng**:
- [ ] CRUD Violation (Vi phạm)
- [ ] Violation Type Management
- [ ] Penalty Calculation
- [ ] Violation Resolution

**Database Tables**:
- `violations` - Vi phạm

**API Endpoints**:
- `GET /api/violations` - Danh sách vi phạm
- `GET /api/violations/{id}` - Chi tiết vi phạm
- `POST /api/violations` - Tạo vi phạm
- `PUT /api/violations/{id}` - Cập nhật vi phạm
- `DELETE /api/violations/{id}` - Xóa vi phạm
- `PATCH /api/violations/{id}/resolve` - Giải quyết vi phạm

**Files cần tạo**:
- `domain/Violation.java`
- `repository/ViolationRepository.java`
- `service/ViolationService.java`
- `controller/ViolationController.java`
- `dto/ViolationDTO.java`

---

## 📢 PHẦN 8: NOTIFICATION MANAGEMENT (Quản lý thông báo)

### 8.1 Notification Management
**Mức độ ưu tiên**: ⭐⭐⭐

**Chức năng**:
- [ ] CRUD Notification (Thông báo)
- [ ] Notification Channels (EMAIL, SMS, ZALO, IN_APP)
- [ ] Notification Templates
- [ ] Notification Scheduling
- [ ] Notification Status Tracking

**Database Tables**:
- `notifications` - Thông báo

**API Endpoints**:
- `GET /api/notifications` - Danh sách thông báo
- `GET /api/notifications/{id}` - Chi tiết thông báo
- `POST /api/notifications` - Tạo thông báo
- `PUT /api/notifications/{id}` - Cập nhật thông báo
- `DELETE /api/notifications/{id}` - Xóa thông báo
- `POST /api/notifications/send` - Gửi thông báo
- `GET /api/users/{userId}/notifications` - Thông báo theo user

**Files cần tạo**:
- `domain/Notification.java`
- `repository/NotificationRepository.java`
- `service/NotificationService.java`
- `service/EmailService.java`
- `service/SmsService.java`
- `controller/NotificationController.java`
- `dto/NotificationDTO.java`

---

## 📊 PHẦN 9: REPORTING & ANALYTICS (Báo cáo & Phân tích)

### 9.1 Report Management
**Mức độ ưu tiên**: ⭐⭐⭐

**Chức năng**:
- [ ] Revenue Reports (Báo cáo doanh thu)
- [ ] Occupancy Reports (Báo cáo tỷ lệ lấp đầy)
- [ ] Debt Reports (Báo cáo công nợ)
- [ ] Utility Reports (Báo cáo điện nước)
- [ ] Contract Reports (Báo cáo hợp đồng)
- [ ] Export Reports (Excel, PDF)

**API Endpoints**:
- `GET /api/reports/revenue` - Báo cáo doanh thu
- `GET /api/reports/occupancy` - Báo cáo tỷ lệ lấp đầy
- `GET /api/reports/debt` - Báo cáo công nợ
- `GET /api/reports/utility` - Báo cáo điện nước
- `GET /api/reports/contract` - Báo cáo hợp đồng
- `GET /api/reports/export` - Export báo cáo

**Files cần tạo**:
- `service/ReportService.java`
- `controller/ReportController.java`
- `dto/ReportDTO.java`
- `util/ExcelExporter.java`
- `util/PdfExporter.java`

---

## 🎯 Lộ Trình Phát Triển Đề Xuất

### Phase 1: Foundation (Tuần 1-2)
1. ✅ **Authentication & Authorization** (JWT, RBAC)
2. ✅ **Tenant Management** (CRUD Tenant, Subscription)
3. ✅ **User Management** (CRUD User, Role assignment)

### Phase 2: Core Property (Tuần 3-4)
4. ✅ **Building Management** (CRUD Building)
5. ✅ **Room Management** (CRUD Room, Status management)

### Phase 3: Tenant & Contract (Tuần 5-6)
6. ✅ **Tenant Info Management** (CRUD Tenant Info)
7. ✅ **Contract Management** (CRUD Contract, Renewal, Termination)

### Phase 4: Financial Core (Tuần 7-9)
8. ✅ **Service Management** (CRUD Service, Pricing)
9. ✅ **Utility Reading Management** (CRUD Utility Reading)
10. ✅ **Invoice Management** (CRUD Invoice, Auto generation)
11. ✅ **Payment Management** (CRUD Payment, Methods)

### Phase 5: Advanced Financial (Tuần 10-11)
12. ✅ **Debt Management** (CRUD Debt, Auto calculation, Reminder)

### Phase 6: Operations (Tuần 12-13)
13. ✅ **Maintenance Request Management** (CRUD, Assignment)
14. ✅ **Violation Management** (CRUD, Penalty)

### Phase 7: Communication (Tuần 14)
15. ✅ **Notification Management** (Multi-channel, Templates)

### Phase 8: Analytics (Tuần 15-16)
16. ✅ **Report Management** (Various reports, Export)

---

## 📝 Ghi Chú

- Mỗi module cần có: **Domain Entity**, **Repository**, **Service**, **Controller**, **DTO**, **Mapper**
- Tất cả API phải có: **Authentication**, **Authorization**, **Validation**, **Error Handling**
- Tất cả queries phải filter theo `tenant_id` để đảm bảo tenant isolation
- Sử dụng **Flyway** cho database migration
- Sử dụng **Springdoc OpenAPI** cho API documentation

---

**Cập nhật**: 2026-01-24
