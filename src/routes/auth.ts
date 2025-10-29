import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  logoutAll,
  getUserPermissions,
} from "@/controllers/authController";
import { authenticateToken } from "@/middleware/auth";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// Public routes
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));

// Protected routes
router.get("/profile", authenticateToken, asyncHandler(getProfile));
router.put("/profile", authenticateToken, asyncHandler(updateProfile));
router.put("/change-password", authenticateToken, asyncHandler(changePassword));
router.get("/permissions", authenticateToken, asyncHandler(getUserPermissions));
router.post("/logout", asyncHandler(logout));
router.post("/logout-all", authenticateToken, asyncHandler(logoutAll));

// Public routes
router.post("/refresh", asyncHandler(refreshToken));

export default router;
