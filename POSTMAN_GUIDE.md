# 📮 Postman Collection Guide

## Overview

File collection Postman yang lengkap untuk testing API Inventory Management System dengan fitur authentication dan authorization.

## 📁 Files

- `Inventory_API.postman_collection.json` - Collection utama dengan semua endpoint
- `Inventory_Development.postman_environment.json` - Environment untuk development

## 🚀 Setup

### 1. Import Collection

1. Buka Postman
2. Klik **Import** di sidebar kiri
3. Pilih file `Inventory_API.postman_collection.json`
4. Collection akan muncul di sidebar

### 2. Import Environment

1. Klik **Import** di sidebar kiri
2. Pilih file `Inventory_Development.postman_environment.json`
3. Environment akan tersedia di dropdown environment

### 3. Setup Environment

1. Pilih environment **Inventory Development** di dropdown
2. Pastikan server berjalan di `http://localhost:3000`

## 🧪 Testing Workflow

### Step 1: Health Check

1. Jalankan **Health Check > Server Health**
2. Pastikan response: `{"success":true,"message":"Server is running"}`

### Step 2: Authentication Flow

1. **Register User** - Buat user baru
2. **Login User** - Login dengan user yang baru dibuat
3. **Get Profile** - Test protected endpoint

### Step 3: Admin Testing

1. **Login Admin** - Login sebagai admin (username: admin / password: admin123)
2. **Get All Users** - Test admin endpoint

### Step 4: Error Testing

1. **Register with Invalid Email** - Test validation
2. **Login with Wrong Password** - Test authentication error
3. **Access Protected Route Without Token** - Test authorization
4. **Access Admin Route as User** - Test role-based access

## 🔧 Features

### Auto Token Management

Collection ini memiliki fitur otomatis untuk:

- **Auto-save tokens** setelah login/register
- **Auto-add Authorization header** untuk protected routes
- **Auto-test responses** dengan assertions

### Pre-request Scripts

```javascript
// Auto-add Authorization header if token exists
if (pm.environment.get("accessToken")) {
  pm.request.headers.add({
    key: "Authorization",
    value: "Bearer " + pm.environment.get("accessToken"),
  });
}
```

### Test Scripts

```javascript
// Auto-save tokens after login/register
if (pm.response.json().success && pm.response.json().data) {
  if (pm.response.json().data.token) {
    pm.environment.set("accessToken", pm.response.json().data.token);
  }
  if (pm.response.json().data.refreshToken) {
    pm.environment.set("refreshToken", pm.response.json().data.refreshToken);
  }
  if (pm.response.json().data.user && pm.response.json().data.user.id) {
    pm.environment.set("userId", pm.response.json().data.user.id);
  }
}
```

## 📋 Collection Structure

### 1. Health Check

- **Server Health** - Check server status
- **API Documentation** - Get API endpoints info

### 2. Authentication

- **Register User** - Create new user
- **Login User** - Login with user credentials
- **Login Admin** - Login as admin
- **Refresh Token** - Refresh access token
- **Get Profile** - Get user profile (protected)
- **Update Profile** - Update user profile (protected)
- **Change Password** - Change password (protected)
- **Logout** - Logout (revoke refresh token)
- **Logout All Devices** - Logout from all devices (protected)

### 3. User Management (Admin Only)

- **Get All Users** - Get paginated users list
- **Get User by ID** - Get specific user
- **Update User** - Update user information
- **Delete User** - Delete user (soft delete)

### 4. Error Testing

- **Register with Invalid Email** - Test email validation
- **Register with Weak Password** - Test password validation
- **Login with Wrong Password** - Test authentication error
- **Access Protected Route Without Token** - Test authorization
- **Access Admin Route as User** - Test role-based access

## 🎯 Testing Scenarios

### Scenario 1: Complete User Flow

1. Register new user
2. Login with new user
3. Get profile
4. Update profile
5. Change password
6. Logout

### Scenario 2: Admin Management

1. Login as admin
2. Get all users
3. Get specific user
4. Update user role
5. Delete user

### Scenario 3: Error Handling

1. Try invalid registration
2. Try wrong login
3. Access protected route without token
4. Access admin route as regular user

### Scenario 4: Token Management

1. Login user
2. Use access token for API calls
3. Refresh token when expired
4. Logout (revoke token)
5. Try to use revoked token

## 🔍 Response Validation

Setiap request memiliki test assertions untuk:

- **Status Code** - Pastikan response code benar
- **Response Format** - Pastikan response memiliki format yang benar
- **Data Structure** - Pastikan data memiliki struktur yang diharapkan
- **Success Field** - Pastikan response.success = true

## 📊 Environment Variables

| Variable       | Description          | Auto-set |
| -------------- | -------------------- | -------- |
| `baseUrl`      | API base URL         | No       |
| `accessToken`  | JWT access token     | Yes      |
| `refreshToken` | JWT refresh token    | Yes      |
| `userId`       | Current user ID      | Yes      |
| `adminToken`   | Admin access token   | Manual   |
| `managerToken` | Manager access token | Manual   |
| `userToken`    | User access token    | Manual   |

## 🚨 Troubleshooting

### Common Issues

#### 1. Server Not Running

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution**: Start server dengan `pnpm run dev`

#### 2. Database Not Initialized

```
Error: relation "users" does not exist
```

**Solution**: Run `pnpm run init-db`

#### 3. Token Expired

```
Error: Token expired
```

**Solution**: Use refresh token endpoint atau login ulang

#### 4. Access Denied

```
Error: Insufficient permissions
Error: Admin access required
```

**Solution**: Login sebagai admin untuk akses admin routes

### Debug Tips

1. **Check Environment**: Pastikan environment "Inventory Development" dipilih
2. **Check Variables**: Lihat environment variables di Postman
3. **Check Console**: Lihat console untuk error details
4. **Check Server Logs**: Lihat terminal server untuk error logs

## 📈 Performance Testing

### Load Testing dengan Collection

1. Duplicate collection untuk load testing
2. Remove test scripts untuk performance
3. Use Postman Runner dengan multiple iterations
4. Monitor response times

### Example Runner Configuration

- **Iterations**: 100
- **Delay**: 100ms
- **Data**: Use CSV file dengan test data

## 🔐 Security Testing

### Test Cases

1. **SQL Injection** - Test dengan malicious input
2. **XSS** - Test dengan script tags
3. **Token Manipulation** - Test dengan modified tokens
4. **Rate Limiting** - Test dengan multiple rapid requests
5. **CORS** - Test dengan different origins

## 📝 Best Practices

1. **Always use environment variables** untuk URLs dan tokens
2. **Run tests in sequence** untuk complete workflows
3. **Check assertions** untuk validate responses
4. **Use different environments** untuk dev/staging/prod
5. **Document custom tests** untuk team understanding
6. **Version control** collection dan environment files
7. **Share collections** dengan team untuk consistency

## 🎉 Ready to Test!

Collection ini siap digunakan untuk testing lengkap API Inventory Management System. Semua endpoint, authentication, authorization, dan error handling sudah ter-cover dengan baik!
