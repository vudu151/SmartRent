# Lộ Trình Phát Triển - SmartRent

Tài liệu này mô tả lộ trình phát triển từng bước cho hệ thống SmartRent.

## 🎯 Tổng Quan

Hệ thống SmartRent được phát triển theo **8 Phase** với **16 Module chính**.

---

## 📅 Phase 1: Foundation (Tuần 1-2)

### Module 1: Authentication & Authorization ⭐⭐⭐⭐⭐
**Mục tiêu**: Xây dựng hệ thống xác thực và phân quyền

**Tasks**:
- [ ] Setup Spring Security
- [ ] Implement JWT Token Provider
- [ ] Create Login/Logout API
- [ ] Implement RBAC (Role-Based Access Control)
- [ ] Create Permission System
- [ ] Tenant Context Isolation

**Deliverables**:
- JWT Authentication hoạt động
- RBAC system hoàn chỉnh
- API: `/api/auth/*`

---

### Module 2: Tenant Management ⭐⭐⭐⭐⭐
**Mục tiêu**: Quản lý tenant (chủ trọ) và subscription

**Tasks**:
- [ ] Create Tenant Entity
- [ ] CRUD Tenant API
- [ ] Subscription Management
- [ ] Plan Management

**Deliverables**:
- API: `/api/tenants/*`
- Tenant có thể đăng ký và quản lý subscription

---

### Module 3: User Management ⭐⭐⭐⭐
**Mục tiêu**: Quản lý người dùng hệ thống

**Tasks**:
- [ ] Create User Entity
- [ ] CRUD User API
- [ ] User Role Assignment
- [ ] User Status Management

**Deliverables**:
- API: `/api/users/*`
- Có thể tạo và quản lý users với roles

---

## 📅 Phase 2: Core Property (Tuần 3-4)

### Module 4: Building Management ⭐⭐⭐⭐
**Mục tiêu**: Quản lý tòa nhà/khu trọ

**Tasks**:
- [ ] Create Building Entity
- [ ] CRUD Building API
- [ ] Building Statistics

**Deliverables**:
- API: `/api/buildings/*`
- Có thể tạo và quản lý buildings

---

### Module 5: Room Management ⭐⭐⭐⭐
**Mục tiêu**: Quản lý phòng trọ

**Tasks**:
- [ ] Create Room Entity
- [ ] CRUD Room API
- [ ] Room Status Management
- [ ] Room Search & Filter

**Deliverables**:
- API: `/api/rooms/*`
- Có thể tạo, tìm kiếm và quản lý rooms

---

## 📅 Phase 3: Tenant & Contract (Tuần 5-6)

### Module 6: Tenant Info Management ⭐⭐⭐⭐
**Mục tiêu**: Quản lý thông tin người thuê trọ

**Tasks**:
- [ ] Create TenantInfo Entity
- [ ] CRUD TenantInfo API
- [ ] ID Card Management

**Deliverables**:
- API: `/api/tenants-info/*`
- Có thể quản lý thông tin người thuê

---

### Module 7: Contract Management ⭐⭐⭐⭐⭐
**Mục tiêu**: Quản lý hợp đồng thuê

**Tasks**:
- [ ] Create Contract Entity
- [ ] CRUD Contract API
- [ ] Contract Renewal
- [ ] Contract Termination
- [ ] Contract Number Generation

**Deliverables**:
- API: `/api/contracts/*`
- Có thể tạo, gia hạn, chấm dứt hợp đồng

---

## 📅 Phase 4: Financial Core (Tuần 7-9)

### Module 8: Service Management ⭐⭐⭐⭐
**Mục tiêu**: Quản lý dịch vụ và giá

**Tasks**:
- [ ] Create Service Entity
- [ ] CRUD Service API
- [ ] Service Pricing

**Deliverables**:
- API: `/api/services/*`
- Có thể quản lý dịch vụ (điện, nước, wifi, v.v.)

---

### Module 9: Utility Reading Management ⭐⭐⭐⭐
**Mục tiêu**: Quản lý chỉ số điện nước

**Tasks**:
- [ ] Create UtilityReading Entity
- [ ] CRUD UtilityReading API
- [ ] Consumption Calculation
- [ ] Bulk Import

**Deliverables**:
- API: `/api/utility-readings/*`
- Có thể nhập và tính toán chỉ số điện nước

---

### Module 10: Invoice Management ⭐⭐⭐⭐⭐
**Mục tiêu**: Quản lý hóa đơn

**Tasks**:
- [ ] Create Invoice & InvoiceItem Entities
- [ ] CRUD Invoice API
- [ ] Auto Invoice Generation
- [ ] Invoice PDF Export

**Deliverables**:
- API: `/api/invoices/*`
- Có thể tạo hóa đơn tự động và export PDF

---

### Module 11: Payment Management ⭐⭐⭐⭐⭐
**Mục tiêu**: Quản lý thanh toán

**Tasks**:
- [ ] Create Payment Entity
- [ ] CRUD Payment API
- [ ] Payment Methods Integration
- [ ] Payment History

**Deliverables**:
- API: `/api/payments/*`
- Có thể xử lý thanh toán qua nhiều phương thức

---

## 📅 Phase 5: Advanced Financial (Tuần 10-11)

### Module 12: Debt Management ⭐⭐⭐⭐
**Mục tiêu**: Quản lý công nợ

**Tasks**:
- [ ] Create Debt Entity
- [ ] CRUD Debt API
- [ ] Auto Debt Calculation
- [ ] Debt Reminder System

**Deliverables**:
- API: `/api/debts/*`
- Có thể tự động tính công nợ và gửi nhắc nhở

---

## 📅 Phase 6: Operations (Tuần 12-13)

### Module 13: Maintenance Request Management ⭐⭐⭐
**Mục tiêu**: Quản lý yêu cầu bảo trì

**Tasks**:
- [ ] Create MaintenanceRequest Entity
- [ ] CRUD MaintenanceRequest API
- [ ] Assignment System
- [ ] Cost Tracking

**Deliverables**:
- API: `/api/maintenance-requests/*`
- Có thể quản lý và theo dõi yêu cầu bảo trì

---

### Module 14: Violation Management ⭐⭐⭐
**Mục tiêu**: Quản lý vi phạm

**Tasks**:
- [ ] Create Violation Entity
- [ ] CRUD Violation API
- [ ] Penalty Calculation
- [ ] Resolution Tracking

**Deliverables**:
- API: `/api/violations/*`
- Có thể quản lý vi phạm và phạt

---

## 📅 Phase 7: Communication (Tuần 14)

### Module 15: Notification Management ⭐⭐⭐
**Mục tiêu**: Quản lý thông báo đa kênh

**Tasks**:
- [ ] Create Notification Entity
- [ ] CRUD Notification API
- [ ] Email Service Integration
- [ ] SMS Service Integration
- [ ] Zalo Integration (optional)
- [ ] In-App Notifications

**Deliverables**:
- API: `/api/notifications/*`
- Có thể gửi thông báo qua Email, SMS, Zalo

---

## 📅 Phase 8: Analytics (Tuần 15-16)

### Module 16: Report Management ⭐⭐⭐
**Mục tiêu**: Báo cáo và phân tích

**Tasks**:
- [ ] Revenue Reports
- [ ] Occupancy Reports
- [ ] Debt Reports
- [ ] Utility Reports
- [ ] Contract Reports
- [ ] Export Functionality (Excel, PDF)

**Deliverables**:
- API: `/api/reports/*`
- Có thể tạo và export các loại báo cáo

---

## 📊 Tổng Kết

| Phase | Module | Thời gian | Ưu tiên |
|-------|--------|-----------|---------|
| 1 | Auth & Authorization | Tuần 1-2 | ⭐⭐⭐⭐⭐ |
| 1 | Tenant Management | Tuần 1-2 | ⭐⭐⭐⭐⭐ |
| 1 | User Management | Tuần 1-2 | ⭐⭐⭐⭐ |
| 2 | Building Management | Tuần 3-4 | ⭐⭐⭐⭐ |
| 2 | Room Management | Tuần 3-4 | ⭐⭐⭐⭐ |
| 3 | Tenant Info Management | Tuần 5-6 | ⭐⭐⭐⭐ |
| 3 | Contract Management | Tuần 5-6 | ⭐⭐⭐⭐⭐ |
| 4 | Service Management | Tuần 7-9 | ⭐⭐⭐⭐ |
| 4 | Utility Reading | Tuần 7-9 | ⭐⭐⭐⭐ |
| 4 | Invoice Management | Tuần 7-9 | ⭐⭐⭐⭐⭐ |
| 4 | Payment Management | Tuần 7-9 | ⭐⭐⭐⭐⭐ |
| 5 | Debt Management | Tuần 10-11 | ⭐⭐⭐⭐ |
| 6 | Maintenance Request | Tuần 12-13 | ⭐⭐⭐ |
| 6 | Violation Management | Tuần 12-13 | ⭐⭐⭐ |
| 7 | Notification Management | Tuần 14 | ⭐⭐⭐ |
| 8 | Report Management | Tuần 15-16 | ⭐⭐⭐ |

**Tổng thời gian ước tính**: 16 tuần (4 tháng)

---

## 🚀 Bắt Đầu

**Bước tiếp theo**: Bắt đầu với **Phase 1 - Module 1: Authentication & Authorization**

Xem chi tiết từng module tại: [MODULES.md](./MODULES.md)
