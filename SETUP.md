# 🚀 Quick Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v12 or higher)
3. **pnpm** package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 3. Create PostgreSQL Database

Connect to PostgreSQL and create the database:

```sql
CREATE DATABASE inventory_db;
```

### 4. Initialize Database

```bash
pnpm run init-db
```

This will:

- Create all necessary tables
- Insert default admin user
- Set up database triggers

### 5. Start Development Server

```bash
pnpm run dev
```

The server will start on `http://localhost:3000`

## 🧪 Test the API

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Default Admin User

- **Email**: admin@inventory.com
- **Password**: admin123
- **Role**: admin

## 🔧 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database `inventory_db` exists

### Path Resolution Issues

- Make sure `tsconfig-paths` is installed
- Check `tsconfig.json` path configuration

### Port Already in Use

- Change `PORT` in `.env` file
- Kill existing processes on port 3000

## 📚 Next Steps

1. Explore the API documentation at `http://localhost:3000/api`
2. Check the project structure in `src/` directory
3. Add your business logic in `src/controllers/`
4. Create new models in `src/models/`
5. Add new routes in `src/routes/`

## 🆘 Need Help?

- Check the main `README.md` for detailed documentation
- Review the code structure in `src/` directory
- Test individual components using the provided scripts
