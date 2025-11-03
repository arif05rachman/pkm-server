import { Router } from "express";
import {
  createTransaksiMasuk,
  getAllTransaksiMasuk,
  getTransaksiMasukById,
  updateTransaksiMasukById,
  deleteTransaksiMasukById,
  addDetailTransaksiMasuk,
  updateDetailTransaksiMasukById,
  deleteDetailTransaksiMasukById,
} from "@/controllers/transaksiMasukController";
import { authenticateToken } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/permissions";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all transaksi masuk (admin only)
router.get("/", requireAdmin, asyncHandler(getAllTransaksiMasuk));

// Create new transaksi masuk (admin only)
router.post("/", requireAdmin, asyncHandler(createTransaksiMasuk));

// Get transaksi masuk by ID (admin only)
router.get("/:id", requireAdmin, asyncHandler(getTransaksiMasukById));

// Update transaksi masuk by ID (admin only)
router.put("/:id", requireAdmin, asyncHandler(updateTransaksiMasukById));

// Delete transaksi masuk by ID (admin only)
router.delete("/:id", requireAdmin, asyncHandler(deleteTransaksiMasukById));

// Add detail to transaksi masuk (admin only)
router.post("/:id/details", requireAdmin, asyncHandler(addDetailTransaksiMasuk));

// Update detail transaksi masuk (admin only)
router.put("/:id/details/:detailId", requireAdmin, asyncHandler(updateDetailTransaksiMasukById));

// Delete detail transaksi masuk (admin only)
router.delete("/:id/details/:detailId", requireAdmin, asyncHandler(deleteDetailTransaksiMasukById));

export default router;

