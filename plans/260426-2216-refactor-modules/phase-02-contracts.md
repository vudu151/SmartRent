# Phase 02: Nâng cấp Hợp Đồng & Thanh lý
Status: ⬜ Pending
Dependencies: phase-01-residents.md

## Objective
Kiểm soát vòng đời hợp đồng, cấm xóa hợp đồng đang hiệu lực.

## Requirements
### Functional
- [ ] Backend: Cấm xóa hợp đồng ACTIVE. Bắt buộc dùng chức năng "Thanh lý".
- [ ] Frontend: Vô hiệu hóa nút Xóa đối với hợp đồng ACTIVE.
- [ ] **Validate Form (Nghiệp vụ):** 
  - Ngày bắt đầu / Ngày kết thúc: Ngày kết thúc phải **SAU** Ngày bắt đầu tối thiểu 1 tháng.
  - Tiền cọc: Bắt buộc >= 0. Cảnh báo đỏ nếu gõ số âm hoặc chữ cái.
  - Giá thuê chốt: Bắt buộc >= 0.
  - Kỳ hạn thanh toán (Billing Cycle): Tính theo tháng, chỉ nhận số nguyên dương.

## Implementation Steps
1. [ ] Cập nhật `ContractService.java`.
2. [ ] Cập nhật `contracts.jsx`.

## Files to Create/Modify
- `com/smartrent/service/ContractService.java`
- `smartrent_ui/src/pages/dashboard/contracts.jsx`

---
Next Phase: phase-03-meters-bills.md
