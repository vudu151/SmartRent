# 🎨 DESIGN: Quản lý Xe - SmartRent

Ngày tạo: 2026-04-27
Dựa trên: docs/BRIEF_VEHICLE_MANAGEMENT.md + plans/260427-vehicle-management/

---

## 1. Cách Lưu Thông Tin (Database)

### Sơ đồ quan hệ:

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 BUILDING (Khu trọ)                                      │
│  ├── id, name, address...                                    │
│  └── 1 khu trọ có NHIỀU xe đăng ký                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🚗 VEHICLE (Xe) ← BẢNG MỚI                                 │
│  ├── id (tự tăng)                                            │
│  ├── license_plate (biển số - unique trong building)         │
│  ├── vehicle_type (MOTORBIKE/CAR/BICYCLE/ELECTRIC_BICYCLE)  │
│  ├── brand (hãng xe: Honda, Toyota...)                       │
│  ├── color (màu: Đen, Trắng, Đỏ...)                        │
│  ├── image_url (ảnh chụp xe)                                │
│  ├── monthly_fee (phí gửi/tháng: 100,000đ...)              │
│  ├── notes (ghi chú)                                         │
│  ├── resident_id → FK đến Resident                           │
│  ├── building_id → FK đến Building                           │
│  ├── created_at, updated_at                                  │
│  │                                                           │
│  │  QUAN HỆ:                                                │
│  │  • 1 xe thuộc 1 cư dân (resident_id)                     │
│  │  • 1 xe thuộc 1 khu trọ (building_id)                    │
│  │  • 1 cư dân có thể có NHIỀU xe                           │
│  │  • Biển số KHÔNG được trùng trong cùng khu trọ           │
│  └───────────────────────────────────────────────────────────┘
                            ▲
                            │
┌───────────────────────────┴─────────────────────────────────┐
│  👤 RESIDENT (Cư dân)                                        │
│  ├── id, full_name, phone, email...                          │
│  └── 1 cư dân có thể đăng ký NHIỀU xe                       │
└─────────────────────────────────────────────────────────────┘
```

### SQL Table (MySQL):

```sql
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL,  -- MOTORBIKE, CAR, BICYCLE, ELECTRIC_BICYCLE
    brand VARCHAR(100),                  -- Honda, Toyota, Yamaha...
    color VARCHAR(50),                   -- Đen, Trắng, Đỏ...
    image_url TEXT,                       -- URL ảnh chụp xe
    monthly_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    resident_id BIGINT NOT NULL,
    building_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_vehicle_resident FOREIGN KEY (resident_id) REFERENCES residents(id),
    CONSTRAINT fk_vehicle_building FOREIGN KEY (building_id) REFERENCES buildings(id),

    -- Unique: 1 biển số chỉ xuất hiện 1 lần trong 1 khu trọ
    CONSTRAINT uk_vehicle_plate_building UNIQUE (license_plate, building_id),

    -- Indexes
    INDEX idx_vehicle_building (building_id),
    INDEX idx_vehicle_resident (resident_id),
    INDEX idx_vehicle_type (vehicle_type),
    INDEX idx_vehicle_license_plate (license_plate)
);
```

### VehicleType Enum:

| Giá trị | Tên hiển thị | Phí mặc định (VND) | Màu chip UI |
|---------|-------------|-------------------|------------|
| MOTORBIKE | Xe máy | 100,000 | 🔵 Blue |
| CAR | Ô tô | 500,000 | 🔴 Red |
| BICYCLE | Xe đạp | 30,000 | 🟢 Green |
| ELECTRIC_BICYCLE | Xe đạp điện | 🟠 Orange | 70,000 |

---

## 2. API Endpoints (Chi tiết)

### 2.1. Danh sách xe (GET)

```
GET /api/vehicles?buildingId=1&page=0&size=10&search=59A1
Authorization: Bearer {token}
Roles: TENANT_MANAGER, GUARD

Response:
{
  "content": [
    {
      "id": 1,
      "licensePlate": "59A1-12345",
      "vehicleType": "MOTORBIKE",
      "vehicleTypeName": "Xe máy",
      "brand": "Honda Wave",
      "color": "Đen",
      "imageUrl": "/uploads/vehicle_1.jpg",
      "monthlyFee": 100000,
      "residentId": 5,
      "residentName": "Nguyễn Văn A",
      "roomNumbers": ["A01", "A02"],
      "notes": "",
      "createdAt": "2026-04-27T10:00:00"
    }
  ],
  "totalPages": 1,
  "totalElements": 5,
  "number": 0,
  "size": 10
}

Search logic:
- Tìm theo: license_plate LIKE %search%
              OR resident.full_name LIKE %search%
- Yêu cầu: search.length >= 2 (FE filter, BE vẫn chấp nhận)
```

### 2.2. Thêm xe (POST)

```
POST /api/vehicles?buildingId=1
Authorization: Bearer {token}
Roles: TENANT_MANAGER only

Body:
{
  "licensePlate": "59A1-12345",
  "vehicleType": "MOTORBIKE",
  "brand": "Honda Wave",
  "color": "Đen",
  "imageUrl": "/uploads/vehicle_1.jpg",
  "monthlyFee": 100000,        // Nếu null → dùng phí mặc định theo type
  "residentId": 5,
  "notes": "Xe mới mua"
}

Response: 201 Created
{
  "status": "success",
  "message": "Thêm xe thành công",
  "data": { ...vehicle response }
}

Validation:
- licensePlate: NOT BLANK, max 20 chars
- vehicleType: NOT NULL, phải nằm trong enum
- residentId: NOT NULL, resident phải thuộc building
- Biển số UNIQUE trong building → lỗi 409 nếu trùng
```

### 2.3. Cập nhật xe (PUT)

```
PUT /api/vehicles/1
Authorization: Bearer {token}
Roles: TENANT_MANAGER only

Body: (giống POST)

Response: 200 OK
Validation: Giống POST + check xe phải thuộc building hiện tại
```

### 2.4. Xóa xe (DELETE)

```
DELETE /api/vehicles/1
Authorization: Bearer {token}
Roles: TENANT_MANAGER only

Response: 200 OK
{ "status": "success", "message": "Xóa xe thành công" }
```

---

## 3. Danh Sách Màn Hình

```
┌────────────────────────────────────────────────────────────┐
│  🚗 QUẢN LÝ XE (vehicles.jsx)                              │
│                                                             │
│  Mục đích: Xem, tìm, thêm, sửa, xóa xe cư dân            │
│  Vị trí sidebar: Dưới "Cư dân", trên "Hợp đồng"           │
│  Icon: TruckIcon (heroicons)                                │
│  Quyền: TENANT_MANAGER (CRUD), GUARD (chỉ xem)            │
│                                                             │
│  Layout:                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Navbar: [Quản lý Xe]  [🔍 Tìm biển số...]  [+THÊM] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Ảnh │ Biển số │ Loại │ Hãng/Màu │ Cư dân │ Phòng │  │   │
│  │     │        │  xe  │          │        │       │  │   │
│  │ 🖼  │ 59A1.. │ 🔵XM │ Honda/Đ  │ Ng.V.A │ A01   │  │   │
│  │ 🖼  │ 51F-.. │ 🔴OT │ Toyota/T │ Tr.V.B │ B03   │  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Phân trang: < Trang 1/3 >                           │   │
│  └─────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│  📝 MODAL THÊM/SỬA XE (vehicle-modal.jsx)                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Thêm xe mới / Sửa thông tin xe            │   │
│  │                                                     │   │
│  │  Biển số:      [59A1-12345        ]  * required     │   │
│  │  Loại xe:      [▼ Xe máy          ]  * required     │   │
│  │  Hãng xe:      [Honda Wave        ]                 │   │
│  │  Màu sắc:      [Đen               ]                 │   │
│  │  Cư dân:       [▼ Nguyễn Văn A    ]  * required     │   │
│  │  Phí/tháng:    [100,000           ]  (auto-fill)    │   │
│  │  Ảnh xe:       [📷 Upload ảnh     ]                 │   │
│  │  Ghi chú:      [                  ]                 │   │
│  │                                                     │   │
│  │           [HỦY]              [LƯU]                 │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Luồng Hoạt Động

### Hành trình 1: Chủ trọ đăng ký xe cho cư dân

```
1️⃣ Mở trang "Quản lý Xe" từ sidebar
2️⃣ Bấm nút "+ THÊM"
3️⃣ Modal mở ra → Nhập biển số
4️⃣ Chọn loại xe → Phí tự động điền (VD: Xe máy → 100,000đ)
5️⃣ Chọn cư dân từ dropdown (chỉ hiện cư dân trong khu trọ)
6️⃣ Upload ảnh xe (tùy chọn)
7️⃣ Bấm "Lưu" → Xe xuất hiện trong danh sách
8️⃣ Toast xanh: "Thêm xe thành công"
```

### Hành trình 2: Bảo vệ tra cứu xe

```
1️⃣ Mở trang "Quản lý Xe"
2️⃣ Gõ biển số vào ô tìm kiếm (>=2 ký tự)
3️⃣ Bảng lọc → Hiện xe khớp
4️⃣ Xem: Biển số, chủ xe, phòng
   (KHÔNG thấy nút Thêm/Sửa/Xóa)
```

### Hành trình 3: Chủ trọ xóa xe (cư dân rời đi)

```
1️⃣ Tìm xe trong danh sách
2️⃣ Bấm icon 🗑️ Xóa
3️⃣ Dialog xác nhận: "Bạn có chắc muốn xóa xe 59A1-12345?"
4️⃣ Bấm "Xóa" → Xe biến mất khỏi danh sách
5️⃣ Toast xanh: "Xóa xe thành công"
```

---

## 5. Checklist Kiểm Tra

### ✅ Tính năng: CRUD Xe

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-01: Thêm xe thành công (Happy Path)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: TENANT_MANAGER đã đăng nhập, có cư dân trong khu trọ
When:  Bấm +THÊM, nhập "59A1-12345", chọn "Xe máy", chọn cư dân, bấm Lưu
Then:  ✓ Xe xuất hiện trong danh sách
       ✓ Phí hiển thị 100,000 VND
       ✓ Toast thành công

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-02: Biển số trùng
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Xe "59A1-12345" đã tồn tại trong khu trọ
When:  Thêm xe mới với cùng biển số "59A1-12345"
Then:  ✓ Hiện lỗi "Biển số đã tồn tại trong khu trọ"
       ✓ Không tạo bản ghi mới

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-03: Tìm kiếm xe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Có 10 xe trong khu trọ
When:  Gõ "59A1" vào ô tìm kiếm
Then:  ✓ Chỉ hiện xe có biển số chứa "59A1"
       ✓ Gõ 1 ký tự → KHÔNG gọi API

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-04: Phân quyền Guard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: GUARD đăng nhập
When:  Mở trang Quản lý Xe
Then:  ✓ Xem danh sách xe bình thường
       ✓ KHÔNG thấy nút +THÊM
       ✓ KHÔNG thấy cột Thao tác (sửa/xóa)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-05: Auto-fill phí theo loại xe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Mở form thêm xe
When:  Chọn "Ô tô" ở dropdown loại xe
Then:  ✓ Ô phí tự động điền 500,000
When:  Đổi sang "Xe đạp"
Then:  ✓ Ô phí tự động đổi thành 30,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-06: Sửa thông tin xe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Xe "59A1-12345" đã tồn tại
When:  Bấm sửa, đổi màu "Đen" → "Trắng", bấm Lưu
Then:  ✓ Thông tin cập nhật trong danh sách
       ✓ Toast thành công

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-07: Xóa xe có xác nhận
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Xe "59A1-12345" đã tồn tại
When:  Bấm xóa → Dialog xác nhận hiện ra → Bấm "Xóa"
Then:  ✓ Xe biến mất khỏi danh sách
       ✓ Toast thành công
When:  Bấm xóa → Dialog xác nhận → Bấm "Hủy"
Then:  ✓ Xe vẫn còn, không bị xóa
```

---

## 6. Files Cần Tạo/Sửa (Tổng hợp)

### Backend (Java - Spring Boot):

| # | File | Action | Mô tả |
|---|------|--------|-------|
| 1 | `domain/VehicleType.java` | CREATE | Enum loại xe + phí mặc định |
| 2 | `domain/Vehicle.java` | CREATE | Entity JPA |
| 3 | `repository/VehicleRepository.java` | CREATE | JPA Repository |
| 4 | `dto/vehicle/VehicleRequest.java` | CREATE | Request DTO |
| 5 | `dto/vehicle/VehicleResponse.java` | CREATE | Response DTO |
| 6 | `service/VehicleService.java` | CREATE | Service interface |
| 7 | `service/impl/VehicleServiceImpl.java` | CREATE | Business logic |
| 8 | `controller/VehicleController.java` | CREATE | REST Controller |
| 9 | `domain/Resident.java` | MODIFY | Thêm @OneToMany vehicles |

### Frontend (React - Vite):

| # | File | Action | Mô tả |
|---|------|--------|-------|
| 10 | `api/vehicle.ts` | CREATE | API client |
| 11 | `pages/dashboard/vehicles.jsx` | CREATE | Trang danh sách |
| 12 | `pages/dashboard/vehicle-modal.jsx` | CREATE | Modal thêm/sửa |
| 13 | `pages/dashboard/index.js` | MODIFY | Export mới |
| 14 | `routes.jsx` | MODIFY | Thêm route + sidebar |

**Tổng: 9 files mới + 3 files sửa = 12 files**

---

*Tạo bởi AWF - Design Phase*
