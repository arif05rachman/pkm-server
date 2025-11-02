import { Router } from "express";
import {
  createKaryawan,
  getAllKaryawan,
  searchKaryawan,
  getKaryawanById,
  updateKaryawanById,
  deleteKaryawanById,
  hardDeleteKaryawanById,
} from "@/controllers/karyawanController";
import { authenticateToken } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/permissions";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Search karyawan (admin only) - must be before /:id route
router.get("/search", requireAdmin, asyncHandler(searchKaryawan));

// Get all karyawan (admin only)
router.get("/", requireAdmin, asyncHandler(getAllKaryawan));

// Create new karyawan (admin only)
router.post("/", requireAdmin, asyncHandler(createKaryawan));

// Get karyawan by ID (admin only) - must be after /search route
router.get("/:id", requireAdmin, asyncHandler(getKaryawanById));

// Update karyawan by ID (admin only)
router.put("/:id", requireAdmin, asyncHandler(updateKaryawanById));

// Delete karyawan by ID - soft delete (admin only)
router.delete("/:id", requireAdmin, asyncHandler(deleteKaryawanById));

// Hard delete karyawan by ID - permanent deletion (admin only)
router.delete("/:id/hard", requireAdmin, asyncHandler(hardDeleteKaryawanById));

export default router;

