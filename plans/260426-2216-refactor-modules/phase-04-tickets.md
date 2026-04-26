# Phase 04: Chuẩn hóa Ticket Bảo Trì
Status: ⬜ Pending
Dependencies: phase-03-meters-bills.md

## Objective
Đồng bộ thiết kế và ràng buộc cho hệ thống báo lỗi/sự cố.

## Requirements
### Functional
- [ ] Frontend: Sử dụng Select Dropdown cho Trạng thái sự cố để tránh việc nhập sai lệch dữ liệu.
- [ ] Frontend: Chỉnh sửa lại thiết kế Modal để đảm bảo hiển thị đúng layer (z-index).
- [ ] **Validate Form (Nghiệp vụ):** 
  - Tiêu đề sự cố: Bắt buộc, không được để trống.
  - Mức độ ưu tiên: Dùng Select Dropdown (Cao, Trung bình, Thấp).
  - Trạng thái: Dùng Select Dropdown (Mới, Đang xử lý, Hoàn thành).

## Implementation Steps
1. [ ] Cập nhật form thêm/sửa sự cố trong `ticket-modal.jsx`.

## Files to Create/Modify
- `smartrent_ui/src/pages/dashboard/ticket-modal.jsx`

---
Next Phase: N/A
