# Inventory Management Server

A professional backend server built with Express.js, TypeScript, PostgreSQL, JWT authentication, and bcrypt for secure password hashing.

## 🚀 Features

- **Express.js** with TypeScript for robust API development
- **PostgreSQL** database with connection pooling
- **JWT Authentication** with access and refresh tokens
- **bcrypt** for secure password hashing
- **CORS** configuration for cross-origin requests
- **Rate limiting** to prevent abuse
- **Helmet** for security headers
- **Morgan** for request logging
- **Joi** for request validation
- **Professional project structure** for maintainability

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Database connection
│   └── env.ts        # Environment variables
├── controllers/      # Route controllers
│   └── authController.ts
├── database/         # Database scripts
│   ├── init.sql      # Database schema
│   └── init.ts       # Database initialization
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication middleware
│   ├── cors.ts       # CORS configuration
│   └── errorHandler.ts # Error handling
├── models/           # Database models
│   └── User.ts       # User model
├── routes/           # API routes
│   ├── auth.ts       # Authentication routes
│   └── index.ts      # Main routes
├── services/         # Business logic services
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   ├── bcrypt.ts     # Password hashing
│   └── jwt.ts        # JWT utilities
└── index.ts          # Main server file
```

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Setup environment variables:**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your database credentials and JWT secret.

3. **Setup PostgreSQL database:**

   - Install PostgreSQL
   - Create a database named `inventory_db`:
     ```sql
     CREATE DATABASE inventory_db;
     ```
   - Update database credentials in `.env`

4. **Initialize database:**

   ```bash
   pnpm run init-db
   ```

   This will create tables and insert default data.

5. **Start development server:**

   ```bash
   pnpm run dev
   ```

## 🚀 Usage

### Development

```bash
pnpm run dev
```

### Production

```bash
pnpm run build
pnpm start
```

### Testing

```bash
pnpm test
```

### Linting

```bash
pnpm run lint
pnpm run lint:fix
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (revoke refresh token)
- `POST /api/auth/logout-all` - Logout from all devices
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### User Management (Admin Only)

- `GET /api/users` - Get all users with pagination
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

### Karyawan Management (Admin Only)

- `GET /api/karyawan` - Get all karyawan with pagination
- `GET /api/karyawan/search?q=term` - Search karyawan by name or NIP
- `GET /api/karyawan/:id` - Get karyawan by ID
- `POST /api/karyawan` - Create new karyawan
- `PUT /api/karyawan/:id` - Update karyawan by ID
- `DELETE /api/karyawan/:id` - Delete karyawan (soft delete)
- `DELETE /api/karyawan/:id/hard` - Hard delete karyawan

### Barang Management (Admin Only)

- `GET /api/barang` - Get all barang with pagination (filter: `?jenis=Obat&satuan=pcs`)
- `GET /api/barang/search?q=term` - Search barang by name or location
- `GET /api/barang/:id` - Get barang by ID
- `POST /api/barang` - Create new barang
- `PUT /api/barang/:id` - Update barang by ID
- `DELETE /api/barang/:id` - Delete barang

### Supplier Management (Admin Only)

- `GET /api/supplier` - Get all supplier with pagination
- `GET /api/supplier/search?q=term` - Search supplier by name, alamat, or kontak
- `GET /api/supplier/:id` - Get supplier by ID
- `POST /api/supplier` - Create new supplier
- `PUT /api/supplier/:id` - Update supplier by ID
- `DELETE /api/supplier/:id` - Delete supplier

### Transaksi Masuk (Admin Only)

- `GET /api/transaksi-masuk` - Get all transaksi masuk with pagination (filter: `?startDate=...&endDate=...&id_supplier=...`)
- `GET /api/transaksi-masuk/:id` - Get transaksi masuk by ID (with details)
- `POST /api/transaksi-masuk` - Create transaksi masuk with details
- `PUT /api/transaksi-masuk/:id` - Update transaksi masuk
- `DELETE /api/transaksi-masuk/:id` - Delete transaksi masuk
- `POST /api/transaksi-masuk/:id/details` - Add detail to transaksi masuk
- `PUT /api/transaksi-masuk/:id/details/:detailId` - Update detail transaksi masuk
- `DELETE /api/transaksi-masuk/:id/details/:detailId` - Delete detail transaksi masuk

### Transaksi Keluar (Admin Only)

- `GET /api/transaksi-keluar` - Get all transaksi keluar with pagination (filter: `?startDate=...&endDate=...&tujuan=...`)
- `GET /api/transaksi-keluar/:id` - Get transaksi keluar by ID (with details)
- `POST /api/transaksi-keluar` - Create transaksi keluar with details
- `PUT /api/transaksi-keluar/:id` - Update transaksi keluar
- `DELETE /api/transaksi-keluar/:id` - Delete transaksi keluar
- `POST /api/transaksi-keluar/:id/details` - Add detail to transaksi keluar
- `PUT /api/transaksi-keluar/:id/details/:detailId` - Update detail transaksi keluar
- `DELETE /api/transaksi-keluar/:id/details/:detailId` - Delete detail transaksi keluar

### Log Activity (Admin Only)

- `GET /api/logs` - Get all logs with pagination (filter: `?id_user=...&aksi=...&startDate=...&endDate=...&ip_address=...`)
- `GET /api/logs/search?q=term` - Search logs by description or action
- `GET /api/logs/:id` - Get log by ID
- `GET /api/logs/user/:userId` - Get logs by user ID
- `GET /api/logs/statistics` - Get log statistics by action type
- `POST /api/logs` - Create log activity (usually for internal use)
- `DELETE /api/logs/cleanup?daysOld=90` - Delete old logs

### Health Check

- `GET /api/health` - Server health status
- `GET /api` - API documentation

## 🔐 Authentication & Authorization

### JWT Authentication

The API uses JWT tokens for authentication with refresh token support:

```
Authorization: Bearer <your-access-token>
```

### Features

- **Access Token**: Short-lived (24 hours) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Role-based Access Control**: Admin, Manager, User roles
- **Session Management**: Logout from single or all devices

### Authentication Flow

1. **Login** → Get access token + refresh token
2. **API Requests** → Use access token
3. **Token Expired** → Use refresh token to get new access token
4. **Logout** → Revoke refresh token

### Available Roles

- **Admin**: Full system access
- **Manager**: Products, inventory, reports management
- **User**: Read-only product access

See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed documentation.

## 🗄️ Database Schema

### Users Table

- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (admin, user, manager)
- `is_active` - Account status
- `id_karyawan` - Foreign key to karyawan (nullable)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Karyawan Table

- `id_karyawan` - Primary key
- `nama_karyawan` - Full name
- `jabatan` - Job position
- `nip` - Employee ID number (unique, nullable)
- `no_hp` - Phone number (nullable)
- `alamat` - Address (nullable)
- `status_aktif` - Active status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Barang Table

- `id_barang` - Primary key
- `nama_barang` - Item name
- `satuan` - Unit (pcs, botol, tablet)
- `jenis` - Type (Obat, Alkes, BMHP)
- `stok_minimal` - Minimum stock level
- `lokasi` - Storage location (nullable)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Supplier Table

- `id_supplier` - Primary key
- `nama_supplier` - Company name
- `alamat` - Address (nullable)
- `kontak` - Phone/email (nullable)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Transaksi Masuk Table

- `id_transaksi_masuk` - Primary key
- `tanggal_masuk` - Receipt date
- `id_supplier` - Foreign key to supplier (nullable)
- `id_user` - Foreign key to users (nullable)
- `keterangan` - Notes (nullable)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Detail Transaksi Masuk Table

- `id_detail_masuk` - Primary key
- `id_transaksi_masuk` - Foreign key to transaksi_masuk
- `id_barang` - Foreign key to barang
- `jumlah` - Quantity received
- `harga_satuan` - Unit price
- `tanggal_kadaluarsa` - Expiration date (nullable)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Transaksi Keluar Table

- `id_transaksi_keluar` - Primary key
- `tanggal_keluar` - Outgoing date
- `tujuan` - Destination/receiver name
- `id_user` - Foreign key to users (nullable)
- `keterangan` - Notes (nullable)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Detail Transaksi Keluar Table

- `id_detail_keluar` - Primary key
- `id_transaksi_keluar` - Foreign key to transaksi_keluar
- `id_barang` - Foreign key to barang
- `jumlah` - Quantity sent
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Log Activity Table

- `id_log` - Primary key
- `id_user` - Foreign key to users (nullable)
- `waktu` - Activity timestamp
- `aksi` - Action type (LOGIN, INSERT, UPDATE, DELETE, CETAK, etc.)
- `deskripsi` - Activity description (nullable)
- `ip_address` - User IP address (nullable)
- `created_at` - Creation timestamp

## 🔧 Configuration

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `CORS_ORIGIN` - Allowed CORS origin

## 🧪 Testing

The project includes Jest configuration for testing. Create test files with `.test.ts` or `.spec.ts` extension.

## 📝 Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm run lint` - Check code style
- `pnpm run lint:fix` - Fix code style issues

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Security headers with Helmet
- Input validation
- SQL injection protection with parameterized queries

## 📈 Performance

- Database connection pooling
- Request logging
- Error handling
- Graceful shutdown
- Memory leak prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License
