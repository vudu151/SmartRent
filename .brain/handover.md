━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HANDOVER DOCUMENT - SmartRent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Đang làm: Phase 5 - Verification & Polish
🔢 Đến bước: E2E Testing hoàn tất, còn vài task nhỏ

✅ ĐÃ XONG:
   - Module 1: Auth (Login, Register, JWT, Google OAuth) ✓
   - Module 2: Tenant Management ✓
   - Module 3-9: Rooms, Residents, Contracts, Bills, Services, 
     Meter Readings, Assets, Tickets, Notifications, Dashboard, Portal ✓
   - Phase 4: UI Refinement (Indigo theme, Dark Mode, Grid Cards) ✓
   - Phase 5: E2E Test (6/7 PASS) ✓

⏳ CÒN LẠI:
   - [ ] COMMIT CODE (150+ files chưa commit!!!)
   - [ ] Fix admin default password (BCrypt hash mismatch)
   - [ ] Test responsive trên Mobile
   - [ ] Kiểm tra showToast đồng nhất
   - [ ] Test CRUD đầy đủ với data thực

🔧 QUYẾT ĐỊNH QUAN TRỌNG:
   - API: Tất cả dùng apiFetch + getTenantId (KHÔNG dùng axios)
   - src/api/index.ts: PHẢI dùng named exports (tránh ApiResponse conflict)
   - Dark Mode: Tailwind class strategy ('dark:' prefix)
   - Theme: Indigo chủ đạo (sidenavColor = "indigo")
   - MeterReading: Grid Card layout (không phải Table)
   - LiquidationModal: Biên bản tài chính style

⚠️ LƯU Ý CHO SESSION SAU:
   - COMMIT NGAY khi bắt đầu session mới! 150+ files chưa commit
   - Admin login: admin / admin123 → KHÔNG HOẠT ĐỘNG (hash sai)
   - Workaround: Đăng ký tài khoản mới để test
   - Khi thêm API module mới: cập nhật src/api/index.ts bằng named exports
   - Khi sửa Java Controller/Service: LUÔN kiểm tra dòng 'package' đầu file

📁 FILES QUAN TRỌNG:
   - .brain/brain.json (kiến thức tổng quan)
   - .brain/session.json (trạng thái hiện tại)
   - smartrent_ui/src/api/index.ts (entry point cho tất cả API)
   - smartrent_ui/src/lib/http.ts (HTTP utility với JWT auto-refresh)
   - smartrent_ui/src/context/index.jsx (Dark Mode + Sidenav state)
   - src/main/resources/db/migration/ (DB migrations V1-V14)

🔑 CREDENTIALS:
   - DB: postgres / 123456 @ localhost:5432/smartrent_dev
   - Admin account (broken): admin / admin123
   - JWT Secret: your-secret-key-change-this-in-production-min-256-bits

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Đã lưu! Để tiếp tục: Gõ /recap
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
