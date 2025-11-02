import { Router } from "express";
import {
  createLogActivity,
  getAllLogActivities,
  searchLogActivities,
  getLogActivityById,
  getLogsByUserId,
  getLogStatistics,
  deleteOldLogs,
} from "@/controllers/logActivityController";
import { authenticateToken } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/permissions";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Search log activities (admin only)
router.get("/search", requireAdmin, asyncHandler(searchLogActivities));

// Get log statistics (admin only)
router.get("/statistics", requireAdmin, asyncHandler(getLogStatistics));

// Get logs by user ID (admin only)
router.get("/user/:userId", requireAdmin, asyncHandler(getLogsByUserId));

// Get all log activities (admin only)
router.get("/", requireAdmin, asyncHandler(getAllLogActivities));

// Create log activity (usually for internal use, but available via API)
router.post("/", requireAdmin, asyncHandler(createLogActivity));

// Get log activity by ID (admin only)
router.get("/:id", requireAdmin, asyncHandler(getLogActivityById));

// Delete old logs (admin only)
router.delete("/cleanup", requireAdmin, asyncHandler(deleteOldLogs));

export default router;

