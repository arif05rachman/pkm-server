import { Router } from "express";
import {
  getStockCard,
  getAllTransactions,
} from "@/controllers/reportController";
import { authenticate } from "@/middleware/auth";

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Get stock card report for a product
router.get("/stock-card/:id", getStockCard);

// Get all transactions report
router.get("/transactions", getAllTransactions);

export default router;
