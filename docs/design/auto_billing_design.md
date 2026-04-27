# 🎨 DESIGN: Tự Động Hóa Đơn & Thông Báo

Ngày tạo: 2026-04-27
Dựa trên: `docs/specs/auto_billing_spec.md`

---

## 1. Cách Lưu Thông Tin (Database Schema)

Để lưu trữ các thông báo gửi đến Chủ trọ (Tenant), chúng ta cần tạo thêm một bảng dữ liệu mới (giống như thêm một Sheet mới trong Excel) tên là `NOTIFICATIONS`.

📦 **SƠ ĐỒ LƯU TRỮ:**

┌─────────────────────────────────────────────────────────────┐
│  👤 TENANTS (Chủ trọ)                                       │
│  ├── id                                                     │
│  ├── name                                                   │
│  └── email                                                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ 1 Chủ trọ có nhiều Thông báo
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🔔 NOTIFICATIONS (Thông báo)                               │
│  ├── id (Mã thông báo)                                      │
│  ├── tenant_id (Thuộc về chủ trọ nào?)                      │
│  ├── title (Tiêu đề: VD "Tạo hóa đơn thành công")           │
│  ├── message (Nội dung chi tiết)                            │
│  ├── type (Loại: SUCCESS, WARNING, INFO, ERROR)             │
│  ├── is_read (Đã đọc chưa? True/False)                      │
│  └── created_at (Thời gian tạo)                             │
└─────────────────────────────────────────────────────────────┘

---

## 2. Danh Sách Màn Hình (UI Components)

Tính năng này chạy ngầm (Backend) là chính, phần giao diện (Frontend) chỉ cần cập nhật nhỏ gọn:

| # | Tên | Mục đích | Vị trí hiển thị |
|---|-----|----------|-----------------|
| 1 | **Chuông Thông Báo (Badge)** | Báo hiệu có thông báo mới (chưa đọc) | Góc phải trên cùng (Navbar) cạnh Avatar. |
| 2 | **Danh sách Thông báo (Dropdown)** | Xem nhanh 5-10 thông báo gần nhất | Hiện ra khi bấm vào biểu tượng Chuông. |

---

## 3. Luồng Hoạt Động (User Journey)

🚶 **HÀNH TRÌNH: Nhận và đọc thông báo tạo hóa đơn**

1️⃣ **Nửa đêm (00:00 ngày 1 hàng tháng):** Hệ thống âm thầm quét các phòng. Tự động gom tiền và tạo `Bill` (trạng thái UNPAID, Chủ trọ vẫn có thể sửa). Nếu phòng nào chưa chốt điện/nước, hệ thống tạo một `Notification` cảnh báo.
2️⃣ **Sáng hôm sau:** Chủ trọ đăng nhập vào phần mềm SmartRent.
3️⃣ **Thấy cảnh báo:** Nhìn lên góc phải màn hình, thấy biểu tượng 🔔 có chấm đỏ ghi số "2" (2 thông báo mới).
4️⃣ **Đọc thông báo:** Chủ trọ bấm vào 🔔. Một danh sách xổ xuống hiện ra:
   - ✅ "Thành công: Đã tạo tự động 15 Hóa đơn."
   - ⚠️ "Chú ý: Còn phòng 101, 102 chưa chốt điện nước. Chưa tạo được hóa đơn."
5️⃣ **Đánh dấu đã đọc:** Chủ trọ bấm vào thông báo hoặc bấm "Đánh dấu tất cả đã đọc", chấm đỏ biến mất.
6️⃣ **Hành động:** Chủ trọ vào mục Điện Nước để chốt số bù cho phòng 101, 102. Sau đó vào Hóa Đơn để tự tạo bù hóa đơn, hoặc kiểm tra và sửa lại các hóa đơn đã được tạo tự động trước khi gửi khách.

---

## 4. Checklist Kiểm Tra (Test Cases)

### Tính năng: Tự động tạo Bill & Gửi Notification
SPECS Reference: `docs/specs/auto_billing_spec.md`

**TC-01: Auto Billing (Phòng đã chốt số)**
- [ ] **Given:** Phòng 101 đang có khách ở, đã chốt số điện nước tháng này.
- [ ] **When:** Cronjob chạy.
- [ ] **Then:** Tự tạo 1 Bill mới (UNPAID) gom đủ tiền. Sinh 1 Notification SUCCESS.

**TC-02: Auto Billing (Phòng CHƯA chốt số)**
- [ ] **Given:** Phòng 102 đang có khách ở, CHƯA chốt điện nước.
- [ ] **When:** Cronjob chạy.
- [ ] **Then:** KHÔNG tạo Bill nào cho phòng 102. Sinh 1 Notification WARNING nhắc nhở.

**TC-03: Hiển thị Notification trên UI**
- [ ] **Given:** Có 2 notification `is_read = false`.
- [ ] **When:** Chủ trọ đăng nhập vào web.
- [ ] **Then:** Icon chuông hiện chấm đỏ có số "2".

**TC-04: Đánh dấu đã đọc (Mark as Read)**
- [ ] **Given:** Đang có chấm đỏ số "2".
- [ ] **When:** Chủ trọ bấm vào nút "Đánh dấu đã đọc".
- [ ] **Then:** API cập nhật `is_read = true`. Chấm đỏ biến mất trên UI.

---
*Tạo bởi AWF 2.1 - Design Phase*
