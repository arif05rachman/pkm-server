import { Router } from "express";
import * as stockInController from "@/controllers/stockInController";
import { authenticate, authorize } from "@/middleware/auth";

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Get all stock in transactions
router.get(
  "/",
  authorize(["admin", "manager", "user"]),
  stockInController.getAllStockIn
);

// Get stock in transaction by ID
router.get(
  "/:id",
  authorize(["admin", "manager", "user"]),
  stockInController.getStockInById
);

// Create a new stock in transaction
router.post(
  "/",
  authorize(["admin", "manager"]),
  stockInController.createStockIn
);

// Delete stock in transaction
router.delete("/:id", authorize(["admin"]), stockInController.deleteStockIn);

export default router;
