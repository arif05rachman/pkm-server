# 🧪 API Usage Examples

## Quick Start Testing

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
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

### 3. Get User Profile

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4e5f6..."
  }'
```

### 5. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4e5f6..."
  }'
```

## Admin Operations

### 1. Login as Admin (Default Admin)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 2. Get All Users

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### 3. Get User by ID

```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### 4. Update User

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "manager",
    "is_active": true
  }'
```


## JavaScript/TypeScript Examples

### Frontend Integration

```typescript
class AuthService {
  private baseUrl = "http://localhost:3000/api";

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("accessToken", data.data.token);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data;
    }

    throw new Error(data.message);
  }

  async getProfile() {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.json();
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("accessToken", data.data.token);
      return data.data;
    }

    throw new Error(data.message);
  }

  async logout() {
    const refreshToken = localStorage.getItem("refreshToken");

    await fetch(`${this.baseUrl}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}

// Usage
const authService = new AuthService();

// Login
try {
  const user = await authService.login("test@example.com", "Test123!@#");
  console.log("Logged in:", user);
} catch (error) {
  console.error("Login failed:", error);
}

// Get profile
try {
  const profile = await authService.getProfile();
  console.log("Profile:", profile);
} catch (error) {
  console.error("Failed to get profile:", error);
}
```

### React Hook Example

```typescript
import { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // Try to refresh token
        await refreshToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.data.token);
        await checkAuth();
      } else {
        throw new Error("Refresh failed");
      }
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("accessToken", data.data.token);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      setUser(data.data.user);
      return data.data;
    }

    throw new Error(data.message);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  return { user, loading, login, logout };
};
```

## Error Handling Examples

### Common Error Responses

```json
// 401 Unauthorized
{
  "success": false,
  "message": "Access token required"
}

// 403 Forbidden
{
  "success": false,
  "message": "Admin access required"
}

// 400 Bad Request
{
  "success": false,
  "message": "Password validation failed: Password must be at least 8 characters long"
}

// 409 Conflict
{
  "success": false,
  "message": "User with this email already exists"
}
```

### Error Handling in Frontend

```typescript
const handleApiCall = async (apiCall: () => Promise<Response>) => {
  try {
    const response = await apiCall();

    if (response.status === 401) {
      // Try to refresh token
      await refreshToken();
      // Retry the original request
      return await apiCall();
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes("token")) {
      // Redirect to login
      window.location.href = "/login";
    }
    throw error;
  }
};
```

## Testing with Postman

### Environment Variables

Create these variables in Postman:

- `baseUrl`: `http://localhost:3000/api`
- `accessToken`: (set after login)
- `refreshToken`: (set after login)

### Pre-request Script

```javascript
// Auto-refresh token if expired
if (pm.environment.get("accessToken")) {
  pm.request.headers.add({
    key: "Authorization",
    value: "Bearer " + pm.environment.get("accessToken"),
  });
}
```

### Test Script

```javascript
// Save tokens after login
if (pm.response.json().success) {
  pm.environment.set("accessToken", pm.response.json().data.token);
  pm.environment.set("refreshToken", pm.response.json().data.refreshToken);
}
```

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Authentication Flow"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "Test123!@#"
          capture:
            - json: "$.data.token"
              as: "accessToken"
      - get:
          url: "/api/auth/profile"
          headers:
            Authorization: "Bearer {{ accessToken }}"
```

Run with: `artillery run artillery.yml`
