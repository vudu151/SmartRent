# 💡 BRIEF: Phiếu In Hóa Đơn & Hồ Sơ Phòng

**Ngày tạo:** 2026-04-29
**Brainstorm session:** Conversation 47f4d0bb

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

Khi hệ thống tự động tính tiền (Auto Billing), chủ trọ cần:
- **In phiếu thu** cho từng phòng để đưa khách hoặc dán trước cửa phòng
- **Xem lịch sử giao dịch** của từng phòng (đã trả bao nhiêu, nợ bao nhiêu)
- **QR chuyển khoản** với số tiền chính xác để khách quét thanh toán nhanh

## 2. GIẢI PHÁP ĐỀ XUẤT

### 2.1. Phiếu In Đơn Lẻ (từng phòng)
Mở Modal preview phiếu → In qua trình duyệt (`window.print()` + CSS `@media print`).

**Nội dung phiếu in:**
- Header: Tên khu trọ, địa chỉ, SĐT chủ trọ
- Thông tin phòng + tên khách thuê
- Bảng kê chi tiết:
  - Tiền phòng
  - Tiền điện (số cũ → mới, đơn giá, thành tiền)
  - Tiền nước (số cũ → mới, đơn giá, thành tiền)
  - Dịch vụ/Rác
- Tổng cộng
- Hạn thanh toán
- QR chuyển khoản (VietQR - mã hóa số tiền + nội dung CK)
- Ngày lập phiếu

### 2.2. Trang "Hồ Sơ Phòng" (Room Detail Page)
Trang chi tiết riêng cho mỗi phòng, truy cập bằng cách click số phòng từ bất kỳ đâu.

**Các section trên trang:**
- Thông tin cơ bản (số phòng, tầng, diện tích, giá, trạng thái)
- Cư dân hiện tại
- Hợp đồng đang hiệu lực
- Lịch sử hóa đơn (bảng có filter theo tháng/trạng thái, nút In phiếu)
- Tài sản trong phòng

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Primary:** Chủ trọ (Tenant Manager) - in phiếu, xem lịch sử
- **Secondary:** Quản lý khu trọ (Guard) - xem thông tin phòng

## 4. TÍNH NĂNG

### 🚀 MVP (Làm ngay):
- [ ] Trang Hồ sơ phòng (`/dashboard/rooms/:id`) với các section cơ bản
- [ ] Modal In phiếu thu (preview + print) với chi tiết điện/nước
- [ ] QR chuyển khoản động (VietQR format với số tiền + nội dung)
- [ ] Lịch sử hóa đơn theo phòng (bảng + filter tháng/trạng thái)
- [ ] Click số phòng từ mọi nơi → navigate đến trang Hồ sơ phòng

### 🎁 Phase 2 (Làm sau):
- [ ] Export PDF phiếu thu
- [ ] In hàng loạt tất cả phòng (page-break)
- [ ] Bảng tổng hợp thu chi tháng (trang đầu khi in hàng loạt)
- [ ] Lịch sử điện nước theo phòng (biểu đồ trend)

### 💭 Backlog (Cân nhắc):
- [ ] Gửi phiếu qua Zalo/SMS
- [ ] Chỗ ký tên điện tử
- [ ] Logo khu trọ trên phiếu

## 5. QR CHUYỂN KHOẢN - Chi tiết kỹ thuật

Sử dụng VietQR API (https://api.vietqr.io/) để sinh QR động:
- Input: Ngân hàng + Số TK + Số tiền + Nội dung CK
- Output: Ảnh QR code
- Nội dung CK mẫu: `PHONG A101 T04/2026`
- Thông tin ngân hàng lấy từ Tenant Profile (đã có bankQrUrl)

## 6. ƯỚC TÍNH SƠ BỘ
- **Độ phức tạp:** Trung bình
- **Thời gian:** 2-3 ngày code
- **Rủi ro:**
  - VietQR API có thể thay đổi format → cần fallback hiển thị QR tĩnh
  - CSS print có thể render khác nhau giữa các trình duyệt

## 7. BƯỚC TIẾP THEO
→ Chạy `/visualize` để thiết kế mockup phiếu in
→ Chạy `/plan` để lên task list chi tiết
→ Chạy `/code` để implement

---
*Tạo bởi AWF Brainstorm - 29/04/2026*
