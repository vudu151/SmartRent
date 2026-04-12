# BÁO CÁO KẾT QUẢ KIỂM THỬ HỆ THỐNG SMARTRENT

Tài liệu này tổng hợp các chức năng đã được triển khai và kiểm thử thành công trong giai đoạn di chuyển (migration) từ template sang kiến trúc SaaS mới.

## 1. Danh sách Chức năng đã Kiểm thử Thành công

### 1.1 Quản lý Phòng (Rooms)
- **Tải danh sách**: Hiển thị đúng danh sách phòng theo từng Tenant.
- **Tìm kiếm**: Tìm kiếm theo số phòng (server-side).
- **Thêm mới**: Tạo phòng mới (Số phòng, Tầng, Diện tích, Giá thuê).
- **Chỉnh sửa**: Cập nhật thông tin phòng (Giá thuê, trạng thái).
- **Xóa**: Hiển thị xác nhận xóa và thực hiện xóa mềm (soft delete).

### 1.2 Quản lý Cư dân (Residents)
- **Tải danh sách**: Hiển thị danh sách cư dân cùng thông tin phòng đang ở.
- **Thêm mới**: Tạo cư dân mới, hỗ trợ chọn phòng từ danh sách phòng trống.
- **Gán phòng**: Chức năng chọn phòng trong form cư dân hoạt động chính xác.
- **Tìm kiếm**: Tìm kiếm theo tên hoặc số điện thoại.

### 1.3 Quản lý Phiếu thu (Bills)
- **Tải danh sách**: Hiển thị các khoản thu (Tiền phòng, điện, nước...).
- **Tạo phiếu thu**: Tạo phiếu thu mới gắn với từng phòng cụ thể.
- **Thu tiền**: Chức năng "Đánh dấu đã thanh toán" (Mark as Paid) cập nhật trạng thái ngay lập tức.
- **Tìm kiếm**: Lọc và tìm kiếm phiếu thu theo số phòng.

### 1.4 Quản lý Tài khoản (User Admin)
- **Danh sách người dùng**: Hiển thị toàn bộ người dùng và nhân viên thuộc Tenant.
- **Trạng thái**: Kích hoạt (Activate) hoặc Vô hiệu hóa (Deactivate) tài khoản.
- **Xóa**: Xóa tài khoản người dùng.

### 1.5 Quản lý Tenant (Chủ trọ - Admin Hệ thống)
- **Tải danh sách**: Hiển thị danh sách các chủ trọ.
- **Tìm kiếm Server-side**: Đã fix lỗi tìm kiếm, hỗ trợ tìm theo Tên/Email/SĐT từ DB.
- **Phân trang Server-side**: Đã fix lỗi hiển thị, hỗ trợ chuyển trang và thay đổi số dòng (5, 10, 20...).

### 1.6 Hệ thống & Bảo mật
- **Đăng nhập/Đăng ký**: Xác thực JWT, lưu trữ thông tin session.
- **Phân quyền Tenant**: Đảm bảo dữ liệu bị cô lập hoàn toàn giữa các Tenant (Multi-tenancy).
- **Profile**: Xem thông tin cá nhân và Thay đổi mật khẩu.

## 2. Các lỗi đã được khắc phục (Bug Fixes)

| STT | Lỗi | Cách khắc phục |
|:---:|:---|:---|
| 1 | Lỗi 500 khi tìm kiếm với tham số null trên PostgreSQL | Chuyển sang dùng JPA Specification API để build query động. |
| 2 | Lỗi Infinite Recursion (Lặp vô hạn) giữa Room và Resident | Sử dụng `@EqualsAndHashCode(exclude=...)` của Lombok. |
| 3 | Lỗi không lấy được `tenantId` từ LocalStorage | Fix lại key truy cập `smartrent.user` trong `api/auth.ts`. |
| 4 | Lỗi ngày sinh `dateOfBirth` để trống gây crash backend | Chuẩn hóa dữ liệu về `null` trước khi gửi API. |
| 5 | Trang Tenant load gộp 1000 bản ghi và không tìm kiếm được | Chuyển đổi sang Phân trang và Tìm kiếm phía Server (Backend). |

---
*Ngày báo cáo: 04/04/2026*
*Người thực hiện: Antigravity AI Assistant*
