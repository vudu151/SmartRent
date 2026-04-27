# Specification: Auto Billing & Notifications

## 1. Executive Summary
Tự động hóa luồng sinh hóa đơn hàng tháng cho toàn bộ khu trọ dựa vào trạng thái chốt Điện/Nước và thông báo cho Chủ trọ.

## 2. User Stories
- Là một Chủ trọ (Tenant), tôi muốn hệ thống tự động sinh hóa đơn tiền nhà vào ngày 1 hàng tháng để tôi không phải tính tay.
- Là Chủ trọ, tôi muốn biết những phòng nào chưa chốt số điện nước để nhắc nhở quản lý khu nhà thông qua hệ thống chuông thông báo (Notification) trên Avatar.

## 3. Database Design
Bảng `notifications`:
- `id`: PK
- `tenant_id`: FK -> tenants
- `title`: Varchar (255)
- `message`: Text
- `type`: Enum (INFO, WARNING, SUCCESS, ERROR)
- `is_read`: Boolean (default: false)
- `created_at`: Timestamp

## 4. Logic Flow
1. Cronjob Trigger (`0 0 1 * * ?` - Ngày 1 mỗi tháng lúc 00:00).
2. Lặp qua tất cả Tenants -> Lặp qua tất cả Rooms (trạng thái `OCCUPIED`).
3. Kiểm tra `MeterReading` tháng trước đó.
4. NẾU Có MeterReading -> Tạo `Bill` với trạng thái `UNPAID`. (Lưu ý: Tenant vẫn có toàn quyền chỉnh sửa các thông số của hóa đơn tự động này trên giao diện Quản lý Hóa Đơn).
5. NẾU KHÔNG -> Tạo `Notification` cảnh báo.

## 5. UI Components
- **Dashboard Navbar**: Thêm Icon Bell, gọi API `/api/notifications/unread-count`.
- **Notification Dropdown**: Hiển thị top 5 notifications mới nhất. Nút "Đánh dấu tất cả đã đọc".
