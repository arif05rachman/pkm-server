import { Router } from "express";
import {
  createBarang,
  getAllBarang,
  searchBarang,
  getBarangById,
  updateBarangById,
  deleteBarangById,
} from "@/controllers/barangController";
import { authenticateToken } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/permissions";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Search barang (admin only)
router.get("/search", requireAdmin, asyncHandler(searchBarang));

// Get all barang (admin only)
router.get("/", requireAdmin, asyncHandler(getAllBarang));

// Create new barang (admin only)
router.post("/", requireAdmin, asyncHandler(createBarang));

// Get barang by ID (admin only)
router.get("/:id", requireAdmin, asyncHandler(getBarangById));

// Update barang by ID (admin only)
router.put("/:id", requireAdmin, asyncHandler(updateBarangById));

// Delete barang by ID (admin only)
router.delete("/:id", requireAdmin, asyncHandler(deleteBarangById));

export default router;

