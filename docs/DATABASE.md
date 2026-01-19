# Thiết Kế Database - SmartRent

## 1. Tổng Quan

Database được thiết kế theo mô hình **Multi-Tenant** với shared database và shared schema. Tất cả các bảng đều có cột `tenant_id` để phân biệt dữ liệu giữa các tenant.

## 2. Entity Relationship Diagram (ERD)

### 2.1 Core Entities

```
Tenant (1) ──< (N) User
Tenant (1) ──< (N) Building
Building (1) ──< (N) Room
Room (1) ──< (N) Contract
Contract (1) ──< (N) Invoice
Invoice (1) ──< (N) InvoiceItem
Room (1) ──< (N) UtilityReading
Tenant (1) ──< (N) Service
Contract (1) ──< (N) Debt
Room (1) ──< (N) MaintenanceRequest
```

## 3. Schema Chi Tiết

### 3.1 Tenant Management

#### `tenants`
Quản lý thông tin các tenant (chủ trọ)

```sql
CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    tax_code VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_status ON tenants(status);
```

#### `users`
Người dùng hệ thống (có thể thuộc tenant hoặc admin)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL, -- SUPER_ADMIN, TENANT_ADMIN, TENANT_MANAGER, TENANT_STAFF, TENANT
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, LOCKED
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### `roles` và `permissions`
Quản lý phân quyền RBAC

```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL, -- ROOM, CONTRACT, INVOICE, etc.
    action VARCHAR(50) NOT NULL, -- READ, WRITE, DELETE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
```

### 3.2 Subscription Management

#### `plans`
Gói dịch vụ SaaS

```sql
CREATE TABLE plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL, -- MONTHLY, YEARLY
    max_rooms INTEGER,
    max_users INTEGER,
    features JSONB, -- Danh sách tính năng
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `subscriptions`
Đăng ký dịch vụ của tenant

```sql
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id BIGINT REFERENCES plans(id),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### 3.3 Building & Room Management

#### `buildings`
Quản lý tòa nhà/khu trọ

```sql
CREATE TABLE buildings (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    description TEXT,
    total_floors INTEGER,
    total_rooms INTEGER,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buildings_tenant_id ON buildings(tenant_id);
```

#### `rooms`
Quản lý phòng trọ

```sql
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    building_id BIGINT REFERENCES buildings(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    floor INTEGER,
    area DECIMAL(10,2), -- m²
    price DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2), -- Tiền cọc
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED
    amenities JSONB, -- Tiện ích: wifi, điều hòa, v.v.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, building_id, room_number)
);

CREATE INDEX idx_rooms_tenant_id ON rooms(tenant_id);
CREATE INDEX idx_rooms_building_id ON rooms(building_id);
CREATE INDEX idx_rooms_status ON rooms(status);
```

### 3.4 Tenant (Người Thuê) Management

#### `tenants_info` (đổi tên để tránh nhầm lẫn với bảng tenants)
Thông tin người thuê trọ

```sql
CREATE TABLE tenants_info (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- tenant_id ở đây là chủ trọ
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    id_card VARCHAR(20), -- CCCD/CMND
    id_card_issue_date DATE,
    id_card_issue_place VARCHAR(255),
    permanent_address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_info_tenant_id ON tenants_info(tenant_id);
CREATE INDEX idx_tenants_info_phone ON tenants_info(phone);
```

### 3.5 Contract Management

#### `contracts`
Hợp đồng thuê trọ

```sql
CREATE TABLE contracts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_info_id BIGINT NOT NULL REFERENCES tenants_info(id),
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, TERMINATED, RENEWED
    terms TEXT, -- Điều khoản hợp đồng
    signed_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX idx_contracts_room_id ON contracts(room_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);
```

### 3.6 Service & Pricing

#### `services`
Dịch vụ (điện, nước, wifi, v.v.)

```sql
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- ELECTRICITY, WATER, WIFI, CLEANING, SECURITY, OTHER
    unit VARCHAR(20), -- kWh, m³, tháng, v.v.
    price DECIMAL(10,2),
    calculation_method VARCHAR(50), -- FIXED, PER_UNIT, PERCENTAGE
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_tenant_id ON services(tenant_id);
CREATE INDEX idx_services_type ON services(type);
```

### 3.7 Utility Management

#### `utility_readings`
Chỉ số điện nước

```sql
CREATE TABLE utility_readings (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id),
    reading_date DATE NOT NULL,
    previous_reading DECIMAL(10,2),
    current_reading DECIMAL(10,2) NOT NULL,
    consumption DECIMAL(10,2), -- current - previous
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, room_id, service_id, reading_date)
);

CREATE INDEX idx_utility_readings_tenant_id ON utility_readings(tenant_id);
CREATE INDEX idx_utility_readings_room_id ON utility_readings(room_id);
CREATE INDEX idx_utility_readings_reading_date ON utility_readings(reading_date);
```

### 3.8 Invoice Management

#### `invoices`
Hóa đơn

```sql
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contract_id BIGINT REFERENCES contracts(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    period_start DATE, -- Kỳ tính từ
    period_end DATE,   -- Kỳ tính đến
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    remaining_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, PARTIAL, OVERDUE, CANCELLED
    payment_method VARCHAR(50),
    paid_at TIMESTAMP,
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_contract_id ON invoices(contract_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
```

#### `invoice_items`
Chi tiết hóa đơn

```sql
CREATE TABLE invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- RENT, ELECTRICITY, WATER, WIFI, OTHER
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
```

#### `payments`
Thanh toán

```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id BIGINT REFERENCES invoices(id),
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- CASH, BANK_TRANSFER, VNPAY, MOMO
    payment_reference VARCHAR(255), -- Số tham chiếu
    status VARCHAR(20) DEFAULT 'COMPLETED', -- PENDING, COMPLETED, FAILED, REFUNDED
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
```

### 3.9 Debt Management

#### `debts`
Công nợ

```sql
CREATE TABLE debts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contract_id BIGINT REFERENCES contracts(id),
    invoice_id BIGINT REFERENCES invoices(id),
    debt_type VARCHAR(50) NOT NULL, -- RENT, UTILITY, PENALTY, OTHER
    amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    remaining_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PARTIAL, PAID, OVERDUE
    priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    notes TEXT,
    last_reminder_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_debts_tenant_id ON debts(tenant_id);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_due_date ON debts(due_date);
```

### 3.10 Maintenance Management

#### `maintenance_requests`
Yêu cầu bảo trì

```sql
CREATE TABLE maintenance_requests (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES rooms(id),
    requested_by BIGINT REFERENCES users(id), -- Người yêu cầu (có thể là người thuê)
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    completed_at TIMESTAMP,
    assigned_to BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_requests_tenant_id ON maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_requests_room_id ON maintenance_requests(room_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
```

### 3.11 Violation Management

#### `violations`
Vi phạm

```sql
CREATE TABLE violations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contract_id BIGINT REFERENCES contracts(id),
    violation_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    penalty_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, RESOLVED, CANCELLED
    resolved_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_violations_tenant_id ON violations(tenant_id);
CREATE INDEX idx_violations_contract_id ON violations(contract_id);
```

### 3.12 Notification Management

#### `notifications`
Thông báo

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- EMAIL, SMS, ZALO, IN_APP
    channel VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## 4. Database Constraints & Rules

### 4.1 Tenant Isolation
- Tất cả queries phải filter theo `tenant_id`
- Foreign keys đảm bảo data integrity
- Row-level security (nếu cần)

### 4.2 Data Integrity
- Unique constraints cho các trường quan trọng
- Foreign key constraints
- Check constraints cho status values

### 4.3 Indexing Strategy
- Index trên `tenant_id` cho tất cả bảng
- Index trên các foreign keys
- Index trên các trường thường query (status, dates)
- Composite indexes cho queries phức tạp

## 5. Migration Strategy

Sử dụng **Flyway** hoặc **Liquibase**:
- Version control cho database schema
- Migration scripts theo thứ tự
- Rollback support

## 6. Backup & Recovery

- **Daily backups**: Full backup
- **Point-in-time recovery**: WAL archiving
- **Replication**: Master-slave setup

## 7. Performance Optimization

- **Connection pooling**: HikariCP
- **Query optimization**: Explain analyze
- **Partitioning**: Có thể partition theo tenant_id nếu cần
- **Archiving**: Archive old data (invoices > 2 years)
