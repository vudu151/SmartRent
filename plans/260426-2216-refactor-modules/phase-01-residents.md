# Phase 01: Đại tu Module Cư Dân
Status: ⬜ Pending
Dependencies: None

## Objective
Áp dụng cơ chế khóa nút Xóa và chặn dữ liệu (Backend) cho Cư Dân, đồng bộ UI form.

## Requirements
### Functional
- [ ] Backend: Chặn xóa cư dân nếu đang có hợp đồng hoặc lịch sử thanh toán (ném BusinessException).
- [ ] Frontend: Làm mờ (disable) nút Xóa cư dân nếu cư dân đang trong trạng thái ACTIVE.
- [ ] Frontend: Fix z-index nếu form bị đè.
- [ ] **Validate Form (Nghiệp vụ):** 
  - Họ tên: Bắt buộc nhập.
  - CCCD: Chuẩn 12 chữ số. Hiển thị cảnh báo ngay khi nhập sai.
  - Số điện thoại: Định dạng SĐT Việt Nam (10 số, bắt đầu bằng 0).

## Implementation Steps
1. [ ] Sửa `ResidentService.java` thêm điều kiện chặn xóa.
2. [ ] Sửa `residents.jsx` cập nhật nút Xóa.

## Files to Create/Modify
- `com/smartrent/service/ResidentService.java`
- `smartrent_ui/src/pages/dashboard/residents.jsx`

---
Next Phase: phase-02-contracts.md
