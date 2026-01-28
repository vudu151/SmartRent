# Hướng dẫn cấu hình Google OAuth (Đăng nhập bằng Google)

## Bước 1: Tạo Google OAuth Credentials

### 1.1. Truy cập Google Cloud Console

1. **Mở trình duyệt** và truy cập: https://console.cloud.google.com/
2. **Đăng nhập** bằng tài khoản Google của bạn
3. **Tạo project mới** hoặc chọn project hiện có:
   - Click vào dropdown project ở top bar
   - Click **"New Project"**
   - Nhập tên: `SmartRent`
   - Click **"Create"**

### 1.2. Bật Google+ API

1. Vào **APIs & Services** → **Library**
2. Tìm **"Google+ API"** hoặc **"Google Identity Services API"**
3. Click **Enable** (Bật)

### 1.3. Tạo OAuth 2.0 Client ID

1. Vào **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → Chọn **"OAuth client ID"**
3. Nếu chưa có OAuth consent screen:
   - Click **"Configure Consent Screen"**
   - Chọn **External** → Click **Create**
   - Điền thông tin:
     - App name: `SmartRent`
     - User support email: Email của bạn
     - Developer contact: Email của bạn
   - Click **Save and Continue**
   - Scopes: Click **Save and Continue** (giữ mặc định)
   - Test users: Click **Save and Continue** (bỏ qua)
   - Click **Back to Dashboard**

4. Tạo OAuth Client ID:
   - Application type: **Web application**
   - Name: `SmartRent Web Client`
   - **Authorized JavaScript origins** (BẮT BUỘC):
     - `http://localhost:5173`
     - `http://localhost:3000` (nếu cần)
   - **Authorized redirect URIs** (TÙY CHỌN - có thể để trống):
     - Với Google Sign-In JavaScript SDK, không cần redirect URI
     - Nếu Google yêu cầu, có thể thêm: `http://localhost:5173/oauth2/callback/google`
     - ⚠️ **LƯU Ý**: Vì chúng ta dùng JavaScript SDK (FE xử lý), không cần redirect URI
   - Click **Create**

5. **Copy Client ID** (dạng: `xxxxx.apps.googleusercontent.com`)
   - ⚠️ **LƯU Ý**: Lưu Client ID này lại, bạn sẽ cần nó cho cả backend và frontend

## Bước 2: Cấu hình Backend

### 2.1. Cập nhật application.properties

Mở file `src/main/resources/application.properties` và thêm:

```properties
# Google OAuth Configuration
google.oauth.client-id=your-client-id.apps.googleusercontent.com
```

Hoặc tạo file `application-local.properties`:

```properties
google.oauth.client-id=your-client-id.apps.googleusercontent.com
```

## Bước 3: Cấu hình Frontend

### 3.1. Tạo file .env

Tạo file `.env` trong thư mục `smartrent_ui/`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3.2. Hoặc cập nhật .env.local (khuyến nghị)

Tạo file `.env.local` (đã được gitignore):

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Bước 4: Restart Servers

1. **Restart Backend**: Dừng và chạy lại Spring Boot application
2. **Restart Frontend**: Dừng và chạy lại `npm run dev`

## Bước 5: Test Google Login

1. Mở trang `/auth/sign-in` hoặc `/auth/sign-up`
2. Click button **"Đăng nhập bằng Google"** hoặc **"Đăng ký bằng Google"**
3. Chọn tài khoản Google
4. Cho phép quyền truy cập
5. Kiểm tra xem có đăng nhập thành công và chuyển đến dashboard không

## Troubleshooting

### Lỗi: "Google Sign-In chưa được cấu hình"
- ✅ Kiểm tra file `.env` hoặc `.env.local` có `VITE_GOOGLE_CLIENT_ID` không
- ✅ Đảm bảo đã restart frontend server sau khi thêm env variable

### Lỗi: "Google token không hợp lệ"
- ✅ Kiểm tra `google.oauth.client-id` trong backend `application.properties`
- ✅ Đảm bảo Client ID giống nhau ở frontend và backend
- ✅ Kiểm tra Authorized JavaScript origins có đúng `http://localhost:5173` không

### Lỗi: "Origin mismatch"
- ✅ Kiểm tra Authorized JavaScript origins trong Google Cloud Console
- ✅ Đảm bảo đã thêm `http://localhost:5173`

### Button Google không hiển thị hoặc không hoạt động
- ✅ Kiểm tra console browser có lỗi gì không
- ✅ Đảm bảo Google Sign-In SDK đã được load (kiểm tra Network tab)
- ✅ Kiểm tra `window.google` có tồn tại không trong console

### Lỗi: "Can't continue with google.com. Something went wrong"
- ✅ **Kiểm tra OAuth Consent Screen**: Vào Google Cloud Console → APIs & Services → OAuth consent screen
  - **Cách kiểm tra chế độ Testing**:
    1. Vào: https://console.cloud.google.com/apis/credentials/consent
    2. Xem phần **"Publishing status"** ở đầu trang
    3. Nếu hiển thị **"Testing"**:
       - Cuộn xuống phần **"Test users"**
       - Click **"ADD USERS"** và thêm email Google của bạn
  - Đảm bảo đã điền đầy đủ thông tin (App name, User support email, Developer contact)
  - Nếu app ở chế độ "Testing", cần thêm test users (email của bạn) vào danh sách
  - Hoặc publish app để mọi người có thể sử dụng (không khuyến nghị cho production chưa sẵn sàng)
- ✅ **Kiểm tra Authorized JavaScript origins**: Phải có `http://localhost:5173` (không có dấu `/` ở cuối)
- ✅ **Kiểm tra Client ID**: Đảm bảo Client ID trong `.env.local` khớp với Google Cloud Console
- ✅ **Clear browser cache và cookies**: Đôi khi browser cache gây vấn đề
- ✅ **Kiểm tra console browser**: Xem có lỗi cụ thể nào không (F12 → Console tab)

### Lỗi: "[GSI_LOGGER]: FedCM get() rejects with IdentityCredentialError"
- ✅ **Nguyên nhân chính**: FedCM (Federated Credential Management) API không thể lấy token
- ✅ **Giải pháp 1 - Kiểm tra OAuth Consent Screen**:
  - Vào: https://console.cloud.google.com/apis/credentials/consent
  - **Cách kiểm tra chế độ Testing**:
    1. Vào Google Cloud Console → **APIs & Services** → **OAuth consent screen**
    2. Hoặc truy cập trực tiếp: https://console.cloud.google.com/apis/credentials/consent
    3. Xem phần **"Publishing status"** ở đầu trang:
       - Nếu hiển thị **"Testing"** → App đang ở chế độ Testing
       - Nếu hiển thị **"In production"** → App đã được publish
    4. Nếu ở chế độ **"Testing"**:
       - Cuộn xuống phần **"Test users"**
       - Click **"ADD USERS"**
       - Thêm email Google của bạn (email dùng để đăng nhập)
       - Click **"ADD"**
       - ⚠️ **QUAN TRỌNG**: Chỉ những email được thêm vào "Test users" mới có thể đăng nhập
  - Đảm bảo app đã được publish hoặc bạn đã được thêm vào "Test users"
  - Nếu app ở chế độ "Testing", thêm email của bạn vào "Test users"
- ✅ **Giải pháp 2 - Kiểm tra Browser Settings**:
  - FedCM yêu cầu browser hỗ trợ và cho phép
  - Thử dùng Chrome/Edge mới nhất
  - Kiểm tra browser flags: `chrome://flags/#fedcm` (nếu có)
- ✅ **Giải pháp 3 - Clear Browser Data**:
  - Clear cookies và cache cho `localhost` và `google.com`
  - Hoặc dùng Incognito/Private mode để test
- ✅ **Giải pháp 4 - Kiểm tra Network**:
  - Đảm bảo không có firewall/proxy chặn kết nối đến Google
  - Thử tắt VPN nếu đang dùng
- ✅ **Giải pháp 5 - Fallback**:
  - Nếu FedCM không hoạt động, Google SDK sẽ tự động fallback sang popup mode
  - Đợi vài giây sau khi click button, popup sẽ xuất hiện

## Lưu ý quan trọng

1. **Client ID phải giống nhau** ở frontend và backend
2. **Authorized JavaScript origins** phải khớp với URL frontend
3. **OAuth Consent Screen** phải được cấu hình đầy đủ
4. Trong development, có thể cần thêm test users vào OAuth consent screen
