# Hướng Dẫn Chạy và Debug Project SmartRent

## 📋 Yêu Cầu Hệ Thống

- **Java**: 21+
- **Maven**: 3.8+
- **Node.js**: 18+
- **PostgreSQL**: 14+
- **IDE**: IntelliJ IDEA / VS Code (khuyến nghị)

## 🗄️ Chuẩn Bị Database

### 1. Tạo Database

```sql
-- Kết nối PostgreSQL với user postgres
CREATE DATABASE smartrent_dev;
```

### 2. Kiểm tra cấu hình database trong `application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev
spring.datasource.username=postgres
spring.datasource.password=123456  # Thay đổi theo password của bạn
```

## 🚀 Chạy Backend (Spring Boot)

### Cách 1: Chạy bằng Maven (Terminal)

```bash
# Di chuyển vào thư mục root
cd d:\Documents\SmartRent

# Build project
mvn clean install

# Chạy với profile dev
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Hoặc chạy không profile (sử dụng application.properties)
mvn spring-boot:run
```

### Cách 2: Chạy bằng IDE (IntelliJ IDEA)

1. **Mở project trong IntelliJ IDEA**
   - File → Open → Chọn thư mục `d:\Documents\SmartRent`

2. **Cấu hình Run Configuration**
   - Run → Edit Configurations
   - Click `+` → Application
   - **Main class**: `com.smartrent.SmartRentApplication`
   - **VM options**: (để trống)
   - **Program arguments**: (để trống)
   - **Environment variables**: (tùy chọn)
   - **Active profiles**: `dev` (nếu muốn dùng dev profile)

3. **Debug Mode**
   - Click vào icon Debug (🐛) hoặc nhấn `Shift + F9`
   - Đặt breakpoint bằng cách click vào số dòng bên trái
   - Khi code chạy đến breakpoint, sẽ dừng lại để debug

4. **Chạy Application**
   - Click vào icon Run (▶️) hoặc nhấn `Shift + F10`

### Cách 3: Chạy bằng VS Code

1. **Cài đặt extensions**:
   - Extension Pack for Java
   - Spring Boot Extension Pack

2. **Tạo launch configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot - SmartRentApplication",
      "request": "launch",
      "mainClass": "com.smartrent.SmartRentApplication",
      "projectName": "smartrent-backend",
      "args": "",
      "vmArgs": "-Dspring.profiles.active=dev"
    }
  ]
}
```

3. **Chạy/Debug**:
   - Nhấn `F5` để debug
   - Hoặc Run → Start Debugging

### Kiểm tra Backend đã chạy

- **Health check**: http://localhost:8080/api/health
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

## 🎨 Chạy Frontend (React + Vite)

### 1. Cài đặt dependencies (lần đầu)

```bash
# Di chuyển vào thư mục frontend
cd d:\Documents\SmartRent\smartrent_ui

# Cài đặt packages
npm install
```

### 2. Chạy Development Server

```bash
# Chạy dev server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### 3. Debug Frontend trong VS Code

1. **Cài đặt extensions**:
   - Debugger for Chrome/Firefox
   - React Developer Tools (browser extension)

2. **Tạo launch configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/smartrent_ui",
      "sourceMaps": true
    }
  ]
}
```

3. **Chạy debug**:
   - Đảm bảo `npm run dev` đang chạy
   - Nhấn `F5` để mở Chrome với debugger

### 4. Debug trong Browser

1. **Chrome DevTools**:
   - Mở http://localhost:5173
   - Nhấn `F12` để mở DevTools
   - Tab **Sources**: Đặt breakpoint trong code
   - Tab **Console**: Xem logs và errors
   - Tab **Network**: Xem API requests/responses

2. **React DevTools**:
   - Cài extension React Developer Tools
   - Tab **Components**: Inspect React components
   - Tab **Profiler**: Analyze performance

## 🔍 Debug Tips

### Backend Debugging

1. **Logging**:
   - Logs được cấu hình trong `application.properties`
   - Xem logs trong console hoặc file log
   - Level: `DEBUG` cho development

2. **Breakpoints**:
   - Đặt breakpoint tại các method trong Controller, Service
   - Inspect variables, call stack
   - Step over (`F8`), Step into (`F7`), Step out (`Shift + F8`)

3. **Database Queries**:
   - `spring.jpa.show-sql=true` để xem SQL queries
   - Sử dụng PostgreSQL client để query trực tiếp

4. **API Testing**:
   - Sử dụng Swagger UI: http://localhost:8080/swagger-ui.html
   - Hoặc Postman/Insomnia
   - Test các endpoints: `/api/auth/login`, `/api/auth/register`

### Frontend Debugging

1. **Console Logs**:
   ```javascript
   console.log('Debug info:', data);
   console.error('Error:', error);
   console.table(arrayData);
   ```

2. **React DevTools**:
   - Inspect component props, state
   - Monitor re-renders
   - Check component hierarchy

3. **Network Tab**:
   - Xem API requests/responses
   - Check status codes, headers, payloads
   - Filter by XHR/Fetch

4. **Breakpoints**:
   - Đặt breakpoint trong `.jsx` files
   - Debug trong Sources tab
   - Watch variables

## 🐛 Troubleshooting

### Backend không chạy

1. **Port đã được sử dụng**:
   ```bash
   # Windows: Tìm process đang dùng port 8080
   netstat -ano | findstr :8080
   # Kill process (thay PID bằng process ID)
   taskkill /PID <PID> /F
   
   # Hoặc đổi port trong application.properties
   server.port=8081
   ```

2. **Database connection error**:
   - Kiểm tra PostgreSQL đang chạy
   - Kiểm tra credentials trong `application.properties`
   - Test connection: `psql -U postgres -d smartrent_dev`

3. **Maven build error**:
   ```bash
   # Clean và rebuild
   mvn clean install -U
   ```

### Frontend không chạy

1. **Port 5173 đã được sử dụng**:
   ```bash
   # Đổi port trong vite.config.ts
   server: {
     port: 5174,
   }
   ```

2. **Dependencies error**:
   ```bash
   # Xóa node_modules và cài lại
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **API không kết nối được**:
   - Kiểm tra backend đang chạy tại http://localhost:8080
   - Kiểm tra proxy config trong `vite.config.ts`
   - Kiểm tra CORS settings trong backend

## 📝 Environment Variables

### Backend

Tạo file `application-local.properties` (gitignored) để override:

```properties
spring.datasource.password=your_password
jwt.secret=your-secret-key-min-256-bits
```

### Frontend

Tạo file `.env` trong `smartrent_ui/`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_BASIC_AUTH_USER=admin
VITE_BASIC_AUTH_PASSWORD=admin
```

## 🔄 Hot Reload

### Backend
- Spring Boot DevTools tự động reload khi code thay đổi
- Cần rebuild: `mvn compile` hoặc IDE auto-compile

### Frontend
- Vite tự động hot reload khi file thay đổi
- Không cần restart server

## 📊 Monitoring

### Backend Health
- Health endpoint: http://localhost:8080/api/health
- Actuator: http://localhost:8080/actuator/health

### Logs
- Backend: Console output hoặc log files
- Frontend: Browser console (F12)

## 🎯 Quick Start Commands

```bash
# Terminal 1: Backend
cd d:\Documents\SmartRent
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2: Frontend
cd d:\Documents\SmartRent\smartrent_ui
npm run dev
```

Sau đó mở browser: http://localhost:5173

## 📚 Tài Liệu Tham Khảo

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
