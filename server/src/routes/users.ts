import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from "@/controllers/userController";
import { authenticate, authorize } from "@/middleware/auth";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(["admin"]));

// Get all users
router.get("/", asyncHandler(getAllUsers));

// Get user by ID
router.get("/:id", asyncHandler(getUserById));

// Update user by ID
router.put("/:id", asyncHandler(updateUserById));

// Delete user by ID
router.delete("/:id", asyncHandler(deleteUserById));

export default router;
