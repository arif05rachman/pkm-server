import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from "@/controllers/userController";
import { authenticateToken } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/permissions";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (admin only)
router.get("/", requireAdmin, asyncHandler(getAllUsers));

// Get user by ID (admin only)
router.get("/:id", requireAdmin, asyncHandler(getUserById));

// Update user by ID (admin only)
router.put("/:id", requireAdmin, asyncHandler(updateUserById));

// Delete user by ID (admin only)
router.delete("/:id", requireAdmin, asyncHandler(deleteUserById));

export default router;
