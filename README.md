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
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Products Table (Example)

- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `sku` - Stock keeping unit
- `price` - Product price
- `stock_quantity` - Current stock
- `min_stock_level` - Minimum stock threshold
- `category` - Product category
- `is_active` - Product status
- `created_by` - User who created the product
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

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
