# SmartRent Frontend

## Cấu trúc Project

```
smartrent_ui/
├── src/                    # App chính (code FE)
│   ├── api/               # API calls (health.ts, ...)
│   ├── lib/               # Utilities (auth.ts, http.ts)
│   ├── pages/             # Pages (auth/, dashboard/)
│   ├── layouts/           # Layouts (auth.jsx, dashboard.jsx)
│   ├── widgets/           # Widgets (cards/, charts/, layout/)
│   ├── smartrent/         # SmartRent specific (auth.jsx, roles.js, RequireAuth.jsx)
│   ├── context/           # React Context (MaterialTailwindControllerProvider)
│   ├── configs/           # Configs (charts-config.js)
│   ├── data/              # Static data (tables, statistics)
│   ├── App.jsx            # Main App component
│   └── main.jsx           # Entry point
├── public/                # Public assets
│   ├── img/               # Images
│   └── css/               # CSS (tailwind.css)
├── package.json           # Dependencies
├── vite.config.ts         # Vite config (proxy, alias)
├── tailwind.config.cjs    # Tailwind config
├── jsconfig.json          # Path alias (@ -> src/)
└── index.html             # HTML entry
```

## Requirements

- Node.js 18+
- npm 9+

## Cài đặt

```bash
cd smartrent_ui
npm install
```

## Chạy Development Server

```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:5173**

## Build Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## API Integration

### Proxy Configuration

Trong development, Vite proxy tự động chuyển `/api/*` sang backend:

- FE gọi: `fetch("/api/health")`
- Tự chuyển sang: `http://localhost:8080/api/health`

### Sử dụng API Client

```javascript
import { apiFetch } from '@/lib/http'
import { healthApi } from '@/api/health'

// Cách 1: Dùng apiFetch trực tiếp
const data = await apiFetch('/api/health')

// Cách 2: Dùng API module
const health = await healthApi.get()
```

### Environment Variables

Tạo file `.env` (hoặc copy từ `env.example`):

```env
VITE_API_BASE_URL=http://localhost:8080
# VITE_BASIC_AUTH_USER=admin
# VITE_BASIC_AUTH_PASSWORD=admin
```

## Authentication

App sử dụng 2 loại auth:

1. **Session Auth** (SmartRent): `src/smartrent/auth.jsx` - Quản lý session (email, role, tenantId) trong localStorage
2. **Basic Auth** (API): `src/lib/auth.ts` - Quản lý Basic Auth header cho API calls

## Tech Stack

- **React 18.2.0** - UI Framework
- **Vite 4.5.0** - Build tool
- **React Router DOM 6.17.0** - Routing
- **Material Tailwind React 2.1.4** - UI Components
- **Tailwind CSS 3.3.4** - Styling
- **ApexCharts** - Charts
- **TypeScript** - Type checking (optional, hiện tại dùng JS)
