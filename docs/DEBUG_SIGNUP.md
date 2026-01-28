# Hướng dẫn Debug Chức năng Đăng ký

## Các điểm đặt Breakpoint

### Flow đăng ký:
1. User nhập form → 2. Validate → 3. Gọi API → 4. Xử lý response → 5. Lưu token → 6. Navigate

### 1. **sign-up.jsx** (Form Component)
```
File: smartrent_ui/src/pages/auth/sign-up.jsx
Line 59: await signUp(email, password, confirmPassword, null, null);
```
- **Kiểm tra**: Dữ liệu form (email, password, confirmPassword)
- **Watch**: `email`, `password`, `confirmPassword`

### 2. **auth.jsx** (Auth Provider) ⚠️ QUAN TRỌNG
```
File: smartrent_ui/src/smartrent/auth.jsx
Line 94: signUp: async (email, password, confirmPassword, fullName, phone) => {
Line 95:   try {
Line 96:     setIsLoading(true);
Line 97:     const response = await apiSignUp({  ← ĐẶT BREAKPOINT Ở ĐÂY!
Line 105: if (response.success && response.data) {
Line 109: saveTokens(accessToken, refreshToken, userInfo);
```
- **Line 97**: ⭐ ĐẶT BREAKPOINT Ở ĐÂY (KHÔNG phải line 94!)
- **Line 97**: Kiểm tra request body trước khi gửi
- **Line 105**: Kiểm tra response từ backend
- **Line 109**: Kiểm tra tokens trước khi lưu

### 3. **auth.ts** (API Layer)
```
File: smartrent_ui/src/api/auth.ts
Line 62-63: const response = await apiFetch<LoginResponse>('/api/auth/register', {
```
- **Kiểm tra**: Request object trước khi gửi
- **Watch**: `request` object

### 4. **http.ts** (HTTP Client)
```
File: smartrent_ui/src/lib/http.ts
Line 54: const url = resolveUrl(path)
Line 74: const res = await fetch(url, {
Line 118: if (isJson) return (await res.json()) as T
```
- **Line 54**: Kiểm tra URL cuối cùng
- **Line 74**: Kiểm tra request headers và body
- **Line 118**: Kiểm tra response data

## Cách sử dụng Debug Console

### ⚠️ QUAN TRỌNG: Breakpoint không hoạt động?

**Vấn đề**: Breakpoint đặt ở VS Code không được hit khi chạy Vite dev server.

**Giải pháp**: Dùng **Chrome DevTools** thay vì VS Code debugger (khuyến nghị)

### Cách 1: Chrome DevTools (Khuyến nghị - Dễ nhất)

1. **Chạy dev server**:
   ```bash
   cd smartrent_ui
   npm run dev
   ```

2. **Mở trình duyệt**: http://localhost:5173

3. **Mở Chrome DevTools** (F12 hoặc Ctrl+Shift+I)

4. **Tab Sources**:
   - Tìm file: `src/smartrent/auth.jsx`
   - Đặt breakpoint ở **Line 97** (KHÔNG phải line 94!)
   - Line 97: `const response = await apiSignUp({`

5. **Thực hiện đăng ký** → Breakpoint sẽ được hit!

### Cách 2: VS Code Debugger (Nếu muốn dùng)

1. **Chạy Chrome với remote debugging**:
   ```bash
   # Windows
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
   ```

2. **Trong VS Code**:
   - Mở Run and Debug (Ctrl+Shift+D)
   - Chọn "Attach to Chrome"
   - Click Start Debugging

3. **Đặt breakpoint** ở Line 97 (trong function body, không phải function declaration)

### ⚠️ Lưu ý về Breakpoint:

- ❌ **SAI**: Đặt breakpoint ở Line 94 (function declaration)
  ```javascript
  signUp: async (email, password, confirmPassword, fullName, phone) => {
  ```

- ✅ **ĐÚNG**: Đặt breakpoint ở Line 97 (trong function body)
  ```javascript
  const response = await apiSignUp({
  ```

### Tab DevTools:

1. **Tab Sources**: Đặt breakpoint
2. **Tab Console**: Xem logs (đã có debug logging trong http.ts)
3. **Tab Network**: Xem API requests/responses

## Variables cần Watch

### Trong sign-up.jsx:
- `email`, `password`, `confirmPassword`
- `isSubmitting`, `error`

### Trong auth.jsx:
- `response` (từ apiSignUp)
- `response.success`, `response.data`
- `accessToken`, `refreshToken`, `userInfo`

### Trong auth.ts:
- `request` (SignUpRequest object)
- `response` (LoginResponse)

### Trong http.ts:
- `url` (final URL)
- `headers` (request headers)
- `body` (request body)
- `res` (fetch response)
- `text` (response text nếu có lỗi)

## Debug Tips

1. **Step Over (F10)**: Chạy từng dòng
2. **Step Into (F11)**: Vào trong function
3. **Step Out (Shift+F11)**: Ra khỏi function
4. **Continue (F8)**: Tiếp tục chạy

## Common Issues để kiểm tra

1. **Request body**: Kiểm tra `body` có đúng format JSON không
2. **URL**: Kiểm tra URL có đúng endpoint không
3. **Headers**: Kiểm tra Authorization header
4. **Response**: Kiểm tra `response.success` và `response.data`
5. **Error**: Kiểm tra `error.message` và `error.details`
