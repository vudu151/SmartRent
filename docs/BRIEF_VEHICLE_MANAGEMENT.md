# 💡 BRIEF: Quản lý Xe - SmartRent

**Ngày tạo:** 2026-04-27
**Module:** Vehicle Management
**Tích hợp vào:** SmartRent SaaS Property Management System

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Chủ trọ cần quản lý xe của cư dân gửi trong khu trọ để:
- Kiểm soát an ninh (biết xe nào của ai, phòng nào)
- Thu phí gửi xe hàng tháng theo đúng loại xe
- Bảo vệ có thể tra cứu nhanh xe khi cần

## 2. GIẢI PHÁP ĐỀ XUẤT
Thêm module "Quản lý Xe" vào hệ thống SmartRent, liên kết trực tiếp với cư dân (Resident) và phòng (Room), đồng thời tích hợp phí gửi xe vào hệ thống hóa đơn (Bills) hiện có.

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Primary:** Chủ trọ (TENANT_MANAGER) - Toàn quyền CRUD
- **Secondary:** Bảo vệ (GUARD) - Chỉ xem danh sách, tra cứu

## 4. TÍNH NĂNG

### 🚀 MVP (Bắt buộc có):
- [ ] CRUD xe (Thêm / Sửa / Xóa / Xem danh sách)
- [ ] Thông tin xe: Biển số, Loại xe, Màu sắc, Ảnh chụp
- [ ] Loại xe hỗ trợ: Xe máy, Ô tô, Xe đạp, Xe đạp điện
- [ ] Liên kết xe với Cư dân (Resident) và Phòng (Room)
- [ ] Phí gửi xe theo tháng, khác nhau theo loại xe
- [ ] Phân quyền: Chủ trọ CRUD, Bảo vệ chỉ xem
- [ ] Tìm kiếm xe theo biển số, tên cư dân, số phòng

### 🎁 Phase 2 (Làm sau):
- [ ] Lịch sử ra vào (check-in/check-out)
- [ ] Xuất báo cáo phí gửi xe
- [ ] Thẻ xe QR code
- [ ] Cảnh báo xe chưa đăng ký

## 5. DATA MODEL (Sơ bộ)

### Entity: Vehicle
| Field | Type | Mô tả |
|-------|------|--------|
| id | Long | ID tự tăng |
| licensePlate | String | Biển số xe (unique trong building) |
| vehicleType | Enum | MOTORBIKE, CAR, BICYCLE, ELECTRIC_BICYCLE |
| brand | String | Hãng xe (Honda, Toyota...) |
| color | String | Màu sắc |
| imageUrl | String | Ảnh chụp xe |
| monthlyFee | BigDecimal | Phí gửi xe/tháng |
| resident | Resident | FK → Resident |
| building | Building | FK → Building |
| notes | String | Ghi chú |
| createdAt | DateTime | Ngày tạo |
| updatedAt | DateTime | Ngày cập nhật |

### Enum: VehicleType
| Value | Tên hiển thị | Phí mặc định (VND) |
|-------|-------------|-------------------|
| MOTORBIKE | Xe máy | 100,000 |
| CAR | Ô tô | 500,000 |
| BICYCLE | Xe đạp | 30,000 |
| ELECTRIC_BICYCLE | Xe đạp điện | 70,000 |

## 6. API ENDPOINTS (Sơ bộ)

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | /api/vehicles | Danh sách xe (có phân trang, lọc) | TENANT_MANAGER, GUARD |
| GET | /api/vehicles/{id} | Chi tiết xe | TENANT_MANAGER, GUARD |
| POST | /api/vehicles | Thêm xe mới | TENANT_MANAGER |
| PUT | /api/vehicles/{id} | Sửa thông tin xe | TENANT_MANAGER |
| DELETE | /api/vehicles/{id} | Xóa xe | TENANT_MANAGER |

## 7. UI LAYOUT (Sơ bộ)
- **Trang danh sách:** Bảng hiển thị xe với cột: Ảnh, Biển số, Loại xe, Màu, Cư dân, Phòng, Phí/tháng, Thao tác
- **Modal thêm/sửa:** Form nhập thông tin xe + upload ảnh
- **Sidebar menu:** Thêm icon xe vào sidebar, đặt dưới "Cư dân"

## 8. ƯỚC TÍNH SƠ BỘ
- **Độ phức tạp:** Trung bình
- **Backend:** ~4-6 files mới (Entity, DTO, Repository, Service, Controller)
- **Frontend:** ~2-3 files mới (vehicles.jsx, vehicle-modal.jsx, api/vehicle.js)

## 9. BƯỚC TIẾP THEO
→ Chạy `/plan` để thiết kế chi tiết
→ Chạy `/design` để thiết kế DB schema + API spec
→ Chạy `/code` để bắt tay vào code
