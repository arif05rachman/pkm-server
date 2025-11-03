# 🔐 Authentication & Authorization Guide

## Overview

Sistem authentication dan authorization yang komprehensif dengan fitur:

- JWT Access Token & Refresh Token
- Role-based Access Control (RBAC)
- Permission-based Authorization
- Session Management
- User Management

## 🏗️ Architecture

### Authentication Flow

1. **Login** → Generate Access Token + Refresh Token
2. **API Requests** → Validate Access Token
3. **Token Expired** → Use Refresh Token to get new Access Token
4. **Logout** → Revoke Refresh Token

### Authorization Levels

- **Admin**: Full access to all resources
- **Manager**: Access to products, inventory, reports
- **User**: Read-only access to products

## 🔑 Authentication Endpoints

### Public Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "user" // optional: admin, manager, user
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6..."
  }
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

#### Logout

```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

### Protected Endpoints

#### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

#### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

#### Change Password

```http
PUT /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

#### Logout All Devices

```http
POST /api/auth/logout-all
Authorization: Bearer <access_token>
```

## 👥 User Management (Admin Only)

### Get All Users

```http
GET /api/users?page=1&limit=10
Authorization: Bearer <admin_token>
```

### Get User by ID

```http
GET /api/users/1
Authorization: Bearer <admin_token>
```

### Update User

```http
PUT /api/users/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "updatedusername",
  "email": "updated@example.com",
  "role": "manager",
  "is_active": true
}
```

### Delete User

```http
DELETE /api/users/1
Authorization: Bearer <admin_token>
```

## 🔧 Middleware Usage

### Authentication Middleware

```typescript
import { authenticateToken } from "@/middleware/auth";

// Protect route
router.get("/protected", authenticateToken, handler);
```

### Authorization Middleware

```typescript
import { requireAdmin, requireAdminOrManager } from "@/middleware/permissions";

// Require admin role
router.delete("/users/:id", authenticateToken, requireAdmin, handler);

// Require admin or manager role
router.get("/reports", authenticateToken, requireAdminOrManager, handler);
```

## 🔒 Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Security

- **Access Token**: Short-lived (24 hours)
- **Refresh Token**: Long-lived (7 days), stored in database
- **Secure Generation**: Crypto.randomBytes for refresh tokens
- **Automatic Cleanup**: Expired tokens are automatically removed

### Session Management

- **Single Device Logout**: Revoke specific refresh token
- **All Devices Logout**: Revoke all user refresh tokens
- **Token Rotation**: New refresh token on each refresh

## 📝 Error Handling

### Common Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Access token required"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "Admin access required"
}
```

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Password validation failed: Password must be at least 8 characters long"
}
```

## 🚀 Usage Examples

### Frontend Integration

#### Login Flow

```javascript
// Login
const loginResponse = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});

const { data } = await loginResponse.json();
localStorage.setItem("accessToken", data.token);
localStorage.setItem("refreshToken", data.refreshToken);
```

#### API Request with Token

```javascript
const response = await fetch("/api/auth/profile", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});
```

#### Token Refresh

```javascript
const refreshToken = async () => {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: localStorage.getItem("refreshToken"),
    }),
  });

  const { data } = await response.json();
  localStorage.setItem("accessToken", data.token);
};
```

## 🔄 Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Test Authentication

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!@#"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123!@#"}'

# Get Profile (use token from login response)
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Admin Routes

```bash
# Get all users (admin only)
curl -X GET http://localhost:4000/api/users \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

## 🎯 Best Practices

1. **Always validate tokens** on protected routes
2. **Use HTTPS** in production
3. **Store tokens securely** (httpOnly cookies recommended)
4. **Implement token refresh** automatically
5. **Log security events** for monitoring
6. **Regular token cleanup** to prevent database bloat
7. **Rate limiting** on authentication endpoints
8. **Strong password policies** enforcement
