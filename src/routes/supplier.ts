import { Router } from "express";
import {
  createSupplier,
  getAllSupplier,
  searchSupplier,
  getSupplierById,
  updateSupplierById,
  deleteSupplierById,
} from "@/controllers/supplierController";
import { authenticateToken } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/permissions";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Search supplier (admin only)
router.get("/search", requireAdmin, asyncHandler(searchSupplier));

// Get all supplier (admin only)
router.get("/", requireAdmin, asyncHandler(getAllSupplier));

// Create new supplier (admin only)
router.post("/", requireAdmin, asyncHandler(createSupplier));

// Get supplier by ID (admin only)
router.get("/:id", requireAdmin, asyncHandler(getSupplierById));

// Update supplier by ID (admin only)
router.put("/:id", requireAdmin, asyncHandler(updateSupplierById));

// Delete supplier by ID (admin only)
router.delete("/:id", requireAdmin, asyncHandler(deleteSupplierById));

export default router;

