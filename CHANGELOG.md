# Changelog - SmartRent

Tất cả các thay đổi quan trọng của dự án sẽ được lưu trữ tại đây.

## [2026-04-13] - Bug Fixes & UI Stability
Hôm nay tập trung vào việc sửa các lỗi nghiêm trọng phát hiện qua E2E Testing và tối ưu hóa hệ thống Type Safety cho Frontend.

### Added
- Thêm interface `Tenant` và `TenantPageResponse` trong `tenant.ts` để tối ưu Type Safety.
- Thêm các thuộc tính mới cho `PortalDTO` (Resident info) để hiển thị chi tiết hơn trên cổng cư dân.

### Fixed
- **BUG-001 (Backend):** Fix lỗi `cannot find symbol getPhoneNumber()` trong `TicketServiceImpl` và `PortalService`. Đã chuyển sang `getPhone()`.
- **BUG-002 (System):** Fix lỗi mã hash mật khẩu admin mặc định (`admin123`) trong migration `V5`. Giờ đây có thể login bình thường.
- **BUG-003 (Frontend):** Fix lỗi trắng trang (crash) tại module "Phòng trọ" do thiếu context `darkMode`.
- **BUG-004 (API):** Fix lỗi `Failed to fetch` của module "Chủ trọ" do truyền tham số không đúng định dạng object.
- **UI:** Ẩn menu "Dịch vụ" bị trùng lặp trong sidebar.

### Security
- Cập nhật hash BCrypt cho tài khoản super admin.

## [2026-04-12] - UI Modernizing (Indigo Theme)
Triển khai hệ thống giao diện hiện đại dựa trên Indigo Design System.

### Added
- Indigo Design System: Sidenav, Table Headers, Buttons.
- Dark Mode support toàn hệ thống.
- Cổng cư dân (Resident Portal) với token-based access.
- Module quản lý tài sản (Room Assets).
- Module thanh lý hợp đồng (Liquidation) với modal chuyên nghiệp.

### Changed
- Refactor toàn bộ API modules sang pattern `apiFetch` (không dùng axios).
- Chuyển `MeterReading` sang Grid Card layout.
