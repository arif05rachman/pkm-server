import { Router } from "express";
import {
  getAllPermissions,
  getPermissionsByRole,
} from "@/controllers/userController";
import { authenticateToken } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/permissions";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all permissions
router.get("/", asyncHandler(getAllPermissions));

// Get permissions by role
router.get("/role/:role", asyncHandler(getPermissionsByRole));

export default router;
