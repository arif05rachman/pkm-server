# Setup Guide - Sistem Inventory Puskesmas Frontend

Panduan lengkap untuk setup aplikasi frontend Sistem Inventory Puskesmas.

## Persyaratan Sistem

- Node.js >= 18.x
- npm >= 9.x atau yarn/pnpm
- Backend server running di `http://localhost:4000`

## 🚀 Quick Start

### 1. Instalasi Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

Buat file `.env` di root folder client:

```bash
echo "VITE_API_URL=http://localhost:4000/api" > .env
```

Atau copy dari `.env.example`:

```bash
cp .env.example .env
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📋 Konfigurasi Environment Variables

| Variable     | Deskripsi       | Default Value             | Required |
| ------------ | --------------- | ------------------------- | -------- |
| VITE_API_URL | URL backend API | http://localhost:4000/api | Yes      |

**Catatan:** Semua environment variables harus diawali dengan `VITE_` agar bisa diakses di frontend.

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🌐 Integrasi dengan Backend

### Start Backend Server

Pastikan backend server sudah running:

```bash
# Di folder server
cd ../server
npm install
npm run dev
```

Server akan berjalan di `http://localhost:4000`

### Default Login Credentials

Untuk testing, gunakan kredensial default:

- **Username:** `admin` atau `admin@example.com`
- **Password:** `admin123`

**Penting:** Ganti password di production!

## 🏗️ Struktur Project

```
client/
├── src/
│   ├── api/              # API clients
│   │   ├── client.ts     # Axios instance & interceptors
│   │   ├── auth.ts       # Authentication API
│   │   ├── barang.ts     # Barang API
│   │   ├── karyawan.ts   # Karyawan API
│   │   └── supplier.ts   # Supplier API
│   ├── components/       # Reusable components
│   │   └── layout/       # Layout components
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/            # Page components
│   │   ├── auth/         # Auth pages (Login, Register)
│   │   ├── dashboard/    # Dashboard
│   │   ├── barang/       # Barang management
│   │   ├── karyawan/     # Karyawan management
│   │   │   ├── KaryawanList.tsx    # Main list component
│   │   │   ├── KaryawanModal.tsx   # Modal component
│   │   │   └── useKaryawan.ts      # Custom hook for logic
│   │   ├── supplier/     # Supplier management
│   │   └── profile/      # User profile
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env                  # Environment variables
├── .env.example          # Example env file
└── package.json
```

## 🔗 Path Aliases

Project menggunakan path aliases dengan awalan `@` untuk memudahkan import. Konfigurasi ada di `vite.config.ts` dan `tsconfig.app.json`.

### Daftar Alias yang Tersedia

| Alias | Path | Contoh |
|-------|------|--------|
| `@` | `src` | `@/utils/theme` |
| `@pages` | `src/pages` | `@pages/auth/Login` |
| `@components` | `src/components` | `@components/layout/DashboardLayout` |
| `@api` | `src/api` | `@api/auth` |
| `@contexts` | `src/contexts` | `@contexts/AuthContext` |
| `@types` | `src/types` | `@types` |
| `@utils` | `src/utils` | `@utils/formatters` |
| `@hooks` | `src/hooks` | `@hooks/useCustom` |
| `@assets` | `src/assets` | `@assets/logo.svg` |

### Contoh Penggunaan

**Menggunakan alias:**
```typescript
// Import dari contexts
import { useAuth } from "@contexts/AuthContext";

// Import types
import type { User, Karyawan } from "@types";

// Import API
import { authApi, karyawanApi } from "@api/auth";

// Import pages
import Login from "@pages/auth/Login";
import Dashboard from "@pages/dashboard/Dashboard";

// Import components
import DashboardLayout from "@components/layout/DashboardLayout";

// Import utils
import { formatDate } from "@utils/formatters";
import { defaultTheme } from "@utils/theme";
```

**Keuntungan:**
- Tidak perlu menghitung `../` untuk relative paths
- Lebih mudah dibaca dan dipahami
- Lebih mudah di-refactor saat struktur folder berubah
- Konsisten di seluruh project

## 🔐 Authentication Flow

1. User login dengan email/password
2. Server mengembalikan access token & refresh token
3. Tokens disimpan di localStorage
4. Setiap API request otomatis menambahkan Bearer token
5. Jika token expired, auto refresh token
6. Jika refresh gagal, redirect ke login

## 📡 API Endpoints yang Digunakan

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh token

### Barang

- `GET /api/barang` - Get all barang
- `GET /api/barang/:id` - Get barang by ID
- `GET /api/barang/search` - Search barang
- `POST /api/barang` - Create barang
- `PUT /api/barang/:id` - Update barang
- `DELETE /api/barang/:id` - Delete barang

### Karyawan

- `GET /api/karyawan` - Get all karyawan
- `GET /api/karyawan/:id` - Get karyawan by ID
- `GET /api/karyawan/search` - Search karyawan
- `POST /api/karyawan` - Create karyawan
- `PUT /api/karyawan/:id` - Update karyawan
- `DELETE /api/karyawan/:id` - Delete karyawan

### Supplier

- `GET /api/supplier` - Get all supplier
- `GET /api/supplier/:id` - Get supplier by ID
- `GET /api/supplier/search` - Search supplier
- `POST /api/supplier` - Create supplier
- `PUT /api/supplier/:id` - Update supplier
- `DELETE /api/supplier/:id` - Delete supplier

## 🛠️ Troubleshooting

### Issue: CORS Error

**Solution:** Pastikan backend CORS sudah dikonfigurasi untuk allow origin `http://localhost:3000`

### Issue: Cannot Connect to Backend

**Solution:**

1. Pastikan backend server running
2. Check `.env` file dengan benar
3. Check URL di browser console (Network tab)

### Issue: Token Expired Error

**Solution:** Logout dan login lagi. Token akan ter-refresh secara otomatis.

### Issue: Build Error

**Solution:**

```bash
# Clear cache dan reinstall
rm -rf node_modules dist .vite
npm install
npm run build
```

## 📦 Production Deployment

### Build Production

```bash
npm run build
```

Build files akan ada di folder `dist/`

### Deploy Options

#### Vercel

```bash
npm install -g vercel
vercel
```

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

#### Manual Upload

Upload seluruh isi folder `dist/` ke web server.

### Environment Variables di Production

Set environment variables di hosting platform:

- `VITE_API_URL` - URL backend production

## 🧪 Testing

Untuk testing manual:

1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Buka browser: `http://localhost:3000`
4. Login dengan kredensial default

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Ant Design Documentation](https://ant.design/)
- [React Router Documentation](https://reactrouter.com/)

## 💡 Tips

1. Gunakan browser DevTools untuk debugging
2. Check Network tab untuk API requests
3. Gunakan React DevTools untuk component debugging
4. Jangan commit file `.env` ke git
5. Selalu test di production mode sebelum deploy

## 🆘 Support

Jika ada masalah atau pertanyaan, silakan hubungi tim development.
