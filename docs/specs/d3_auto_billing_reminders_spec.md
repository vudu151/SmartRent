# 💡 SPEC: Tính năng D3 - Kế toán tự động & Nhắc nợ Gmail

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Chủ trọ hiện tại phải tự nhớ ngày tạo hóa đơn cho các phòng, và tự rà soát xem ai chưa đóng tiền để gửi nhắc nợ thủ công. Việc này tốn nhiều thời gian và dễ sai sót.

## 2. GIẢI PHÁP ĐỀ XUẤT
Hệ thống Kế toán tự động (Cron Job):
- Cho phép chủ trọ cấu hình các mốc thời gian: `Ngày chốt sổ`, `Hạn nộp`, `Số ngày trễ để nhắc`, `Tần suất nhắc`.
- Tự động tạo hóa đơn vào `Ngày chốt sổ`.
- Tự động gửi Email đính kèm file hóa đơn chi tiết vào `Ngày nhắc nợ`.

## 3. THIẾT KẾ DATABASE CẦN THIẾT
**Bảng `tenant_settings` (Mới):**
- `tenant_id` (PK)
- `invoice_generation_day` (int, VD: 1)
- `payment_deadline_day` (int, VD: 5)
- `reminder_delay_days` (int, VD: 2)
- `reminder_frequency_days` (int, VD: 2)

**Bảng `bills` (Cập nhật):**
- Thêm cột `last_reminder_date` (datetime): Lưu thời điểm gửi mail nhắc nợ gần nhất để tính toán chu kỳ gửi tiếp theo.

## 4. TÍCH HỢP BÊN THỨ BA (THƯ VIỆN)
- **Spring Boot Starter Mail:** Cấu hình SMTP (Gmail) để hệ thống gửi mail.
- **Apache POI:** Dùng để Generate file Excel hóa đơn đính kèm vào email gửi đi.

## 5. CÁC JOB CHẠY NGẦM
- **`AutoBillingJob`:** Chạy 00:00 mỗi ngày. Kiểm tra nếu `dayOfMonth == invoice_generation_day` thì tạo Bill mới (type = RENT) cho các phòng đang được thuê.
- **`DebtReminderJob`:** Chạy 08:00 mỗi ngày. Quét hóa đơn `UNPAID` quá hạn. Tạo file Excel, gửi mail, và cập nhật `last_reminder_date`.

## 6. BƯỚC TIẾP THEO
→ Bắt đầu code Phase 01: Cập nhật Database và Entity!
