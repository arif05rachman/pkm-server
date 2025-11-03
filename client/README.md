# Sistem Inventory Puskesmas - Frontend

Frontend aplikasi untuk sistem manajemen inventory puskesmas menggunakan React, TypeScript, Vite, dan Ant Design.

## 🚀 Tech Stack

- **Vite** - Build tool yang cepat
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Ant Design** - UI component library
- **Axios** - HTTP client
- **React Router** - Routing
- **Emotion** - CSS-in-JS styling
- **Day.js** - Date manipulation

## 📦 Instalasi

```bash
npm install
```

## 🔧 Development

Jalankan development server:

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🏗️ Build untuk Production

```bash
npm run build
```

Build files akan tersimpan di folder `dist/`

## 📁 Struktur Project

```
src/
├── api/              # API clients (axios)
│   ├── client.ts     # Axios instance & interceptors
│   ├── auth.ts       # Auth endpoints
│   ├── barang.ts     # Barang (Inventory) endpoints
│   ├── karyawan.ts   # Karyawan (Employee) endpoints
│   └── supplier.ts   # Supplier endpoints
├── components/       # Reusable components
│   └── layout/       # Layout components
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── pages/            # Page components
│   ├── auth/         # Login, Register
│   ├── dashboard/    # Dashboard
│   ├── barang/       # Barang management
│   ├── karyawan/     # Karyawan management
│   ├── supplier/     # Supplier management
│   └── profile/      # User profile
├── types/            # TypeScript types
├── utils/            # Utility functions
└── App.tsx           # Main app component
```

## 🔐 Authentication

Sistem menggunakan JWT dengan access token dan refresh token:
- Access token tersimpan di localStorage
- Auto refresh token saat expired
- Protected routes dengan authentication check

## 🌐 API Configuration

Buat file `.env` di root folder:

```env
VITE_API_URL=http://localhost:4000/api
```

## 📱 Features

### 1. Authentication
- Login dengan email/password
- Register akun baru
- Profile management
- Change password
- Auto token refresh

### 2. Dashboard
- Statistik overview
- Recent items
- Quick navigation

### 3. Barang Management
- CRUD operations
- Search & filter
- Pagination
- Categories: Obat, Alkes, BMHP

### 4. Karyawan Management
- CRUD operations
- Search functionality
- Status management
- Employee information

### 5. Supplier Management
- CRUD operations
- Contact information
- Search & filter

### 6. Profile
- View & edit profile
- Change password
- Account information

## 🎨 UI/UX Features

- Responsive design
- Modern & clean interface
- Loading states
- Error handling
- Success/error notifications
- Confirmation dialogs
- Data tables with sorting & pagination

## 🔒 Security

- JWT authentication
- Protected routes
- Automatic token refresh
- Secure password validation
- XSS protection (Ant Design built-in)

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:4000/api |

## 🚀 Deployment

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
Build folder adalah `dist/` yang siap untuk di-deploy ke static hosting.

## 📄 License

ISC

## 👥 Author

Sistem Inventory Puskesmas Team
