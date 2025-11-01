import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";

const router: Router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// API documentation endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inventory Management API",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        refresh: "POST /api/auth/refresh",
        logout: "POST /api/auth/logout",
        logoutAll: "POST /api/auth/logout-all",
        profile: "GET /api/auth/profile",
        updateProfile: "PUT /api/auth/profile",
        changePassword: "PUT /api/auth/change-password",
      },
      users: {
        getAll: "GET /api/users",
        getById: "GET /api/users/:id",
        updateById: "PUT /api/users/:id",
        deleteById: "DELETE /api/users/:id",
      },
    },
  });
});

export default router;
