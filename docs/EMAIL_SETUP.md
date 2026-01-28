# Hướng dẫn cấu hình Email (Gmail)

## Bước 1: Tạo App Password cho Gmail

### Cách 1: Truy cập trực tiếp

1. **Mở trình duyệt** và đăng nhập vào Gmail
2. **Truy cập link trực tiếp**: https://myaccount.google.com/apppasswords
   - Hoặc vào: https://myaccount.google.com/security
3. Nếu chưa bật **2-Step Verification**:
   - Click **2-Step Verification** → Bật
   - Làm theo hướng dẫn để xác minh số điện thoại
4. Sau khi bật 2-Step Verification, quay lại trang **App passwords**
5. **Chọn ứng dụng**: Chọn **Mail**
6. **Chọn thiết bị**: Chọn **Other (Custom name)**
7. **Nhập tên**: `SmartRent Backend` (hoặc tên bất kỳ)
8. Click **Generate** (Tạo)
9. **Copy mật khẩu 16 ký tự** (hiển thị dạng: `xxxx xxxx xxxx xxxx`)
   - ⚠️ **LƯU Ý**: Bạn chỉ thấy mật khẩu này 1 lần duy nhất, hãy copy ngay!

### Cách 2: Qua Google Account Settings

1. Truy cập: https://myaccount.google.com/
2. Click **Security** (Bảo mật) ở menu bên trái
3. Cuộn xuống tìm **2-Step Verification** → Click vào
4. Nếu chưa bật, bật 2-Step Verification trước
5. Sau khi bật, quay lại trang Security
6. Tìm mục **App passwords** (Mật khẩu ứng dụng)
7. Click vào **App passwords**
8. Nhập mật khẩu Google của bạn để xác nhận
9. Chọn:
   - **Select app**: Mail
   - **Select device**: Other (Custom name)
   - **Enter name**: SmartRent Backend
10. Click **Generate**
11. Copy mật khẩu 16 ký tự

## Bước 2: Cấu hình trong application.properties

### Option 1: Sửa trực tiếp trong application.properties

Mở file `src/main/resources/application.properties` và cập nhật dòng 54-55:

```properties
spring.mail.username=vudu151@gmail.com  # Thay bằng email của bạn
spring.mail.password=xxxx xxxx xxxx xxxx  # App Password 16 ký tự (BỎ KHOẢNG TRẮNG)
```

**Ví dụ:**
- Nếu App Password là: `abcd efgh ijkl mnop`
- Thì điền: `spring.mail.password=abcdefghijklmnop` (bỏ hết khoảng trắng)

### Option 2: Tạo file application-local.properties (Khuyến nghị - Bảo mật hơn)

1. Copy file mẫu:
   ```
   src/main/resources/application-local.properties.example
   ```
   → Copy thành:
   ```
   src/main/resources/application-local.properties
   ```

2. Mở file `application-local.properties` và điền:
   ```properties
   spring.mail.username=vudu151@gmail.com
   spring.mail.password=abcdefghijklmnop  # App Password (bỏ khoảng trắng)
   app.frontend.url=http://localhost:5173
   ```

**Lưu ý:**
- File `application-local.properties` đã được gitignore, không bị commit lên git
- App Password phải bỏ hết khoảng trắng khi điền vào file
- KHÔNG dùng mật khẩu Gmail thông thường, PHẢI dùng App Password

## Bước 3: Tạo file application-local.properties (khuyến nghị)

Để bảo mật, nên tạo file `application-local.properties` (đã được gitignore):

```properties
# Email Configuration
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password-16-chars
```

File này sẽ override các giá trị trong `application.properties` và không bị commit lên git.

## Bước 4: Restart Backend

Sau khi cấu hình xong, restart backend server để áp dụng thay đổi.

## Test Email

1. Mở trang `/auth/forgot-password`
2. Nhập email đã đăng ký
3. Click "Gửi yêu cầu"
4. Kiểm tra email (bao gồm thư mục spam)

## Hình ảnh minh họa các bước

### Bước 1: Vào Google Account Security
- Link: https://myaccount.google.com/security
- Tìm mục **2-Step Verification** → Bật nếu chưa bật

### Bước 2: Vào App Passwords
- Link trực tiếp: https://myaccount.google.com/apppasswords
- Hoặc: Security → 2-Step Verification → App passwords

### Bước 3: Tạo App Password
- Select app: **Mail**
- Select device: **Other (Custom name)**
- Name: **SmartRent Backend**
- Click **Generate**

### Bước 4: Copy mật khẩu
- Mật khẩu hiển thị dạng: `abcd efgh ijkl mnop` (16 ký tự, có khoảng trắng)
- Copy toàn bộ và lưu lại
- Khi điền vào file config: **BỎ HẾT KHOẢNG TRẮNG**

## Troubleshooting

### Lỗi: "Authentication failed"
- ✅ Kiểm tra lại App Password (phải là 16 ký tự, không có khoảng trắng trong file config)
- ✅ Đảm bảo đã bật 2-Step Verification
- ✅ Đảm bảo không dùng mật khẩu Gmail thông thường

### Lỗi: "Connection timeout"
- ✅ Kiểm tra kết nối internet
- ✅ Thử tắt firewall tạm thời để test
- ✅ Kiểm tra port 587 có bị chặn không

### Email không đến
- ✅ Kiểm tra thư mục Spam
- ✅ Kiểm tra console logs của backend để xem có lỗi gì không
- ✅ Đảm bảo email đã được đăng ký trong hệ thống
- ✅ Kiểm tra App Password có đúng không

### Không thấy mục "App passwords"
- ✅ Phải bật **2-Step Verification** trước
- ✅ Đảm bảo đã đăng nhập đúng tài khoản Google
- ✅ Thử truy cập link trực tiếp: https://myaccount.google.com/apppasswords
