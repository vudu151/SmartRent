# Phase 03: Chốt Số Điện Nước & Hóa Đơn
Status: ⬜ Pending
Dependencies: phase-02-contracts.md

## Objective
Nâng cao trải nghiệm nhập liệu: Áp dụng Inline Edit cho chốt số. Bảo vệ hóa đơn đã thu tiền.

## Requirements
### Functional
- [ ] Frontend: Thêm Inline Edit (nhập trực tiếp trên dòng) cho chức năng nhập chỉ số điện nước hàng tháng.
- [ ] Backend: Không cho xóa hóa đơn ở trạng thái PAID.
- [ ] Frontend: Vô hiệu hóa nút Xóa hóa đơn PAID.
- [ ] **Validate Form (Nghiệp vụ):** 
  - Chỉ số Mới (Điện/Nước): **TUYỆT ĐỐI** phải LỚN HƠN HOẶC BẰNG Chỉ số Cũ.
  - Nếu nhập số mới bé hơn số cũ -> Đỏ lòm ngay lập tức, vô hiệu hóa nút Lưu.
  - Ngày ghi số: Không được nhập ngày của tương lai.
  - Hóa đơn: Tổng tiền sau khi cộng các phí phải > 0.

## Implementation Steps
1. [ ] Sửa `meter-reading.jsx` áp dụng cơ chế Inline Edit.
2. [ ] Sửa `BillService.java` chặn xóa hóa đơn PAID.
3. [ ] Sửa `bills.jsx` disable nút Xóa.

## Files to Create/Modify
- `smartrent_ui/src/pages/dashboard/meter-reading.jsx`
- `com/smartrent/service/BillService.java`
- `smartrent_ui/src/pages/dashboard/bills.jsx`

---
Next Phase: phase-04-tickets.md
