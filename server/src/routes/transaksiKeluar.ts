import { Router } from "express";
import {
  createTransaksiKeluar,
  getAllTransaksiKeluar,
  getTransaksiKeluarById,
  updateTransaksiKeluarById,
  deleteTransaksiKeluarById,
  addDetailTransaksiKeluar,
  updateDetailTransaksiKeluarById,
  deleteDetailTransaksiKeluarById,
} from "@/controllers/transaksiKeluarController";
import { authenticateToken } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/permissions";
import { asyncHandler } from "@/middleware/errorHandler";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all transaksi keluar (admin only)
router.get("/", requireAdmin, asyncHandler(getAllTransaksiKeluar));

// Create new transaksi keluar (admin only)
router.post("/", requireAdmin, asyncHandler(createTransaksiKeluar));

// Get transaksi keluar by ID (admin only)
router.get("/:id", requireAdmin, asyncHandler(getTransaksiKeluarById));

// Update transaksi keluar by ID (admin only)
router.put("/:id", requireAdmin, asyncHandler(updateTransaksiKeluarById));

// Delete transaksi keluar by ID (admin only)
router.delete("/:id", requireAdmin, asyncHandler(deleteTransaksiKeluarById));

// Add detail to transaksi keluar (admin only)
router.post("/:id/details", requireAdmin, asyncHandler(addDetailTransaksiKeluar));

// Update detail transaksi keluar (admin only)
router.put("/:id/details/:detailId", requireAdmin, asyncHandler(updateDetailTransaksiKeluarById));

// Delete detail transaksi keluar (admin only)
router.delete("/:id/details/:detailId", requireAdmin, asyncHandler(deleteDetailTransaksiKeluarById));

export default router;

