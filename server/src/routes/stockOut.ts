import { Router } from "express";
import * as stockOutController from "@/controllers/stockOutController";
import { authenticate, authorize } from "@/middleware/auth";

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Get all stock out transactions
router.get(
  "/",
  authorize(["admin", "manager", "user"]),
  stockOutController.getAllStockOut
);

// Get stock out transaction by ID
router.get(
  "/:id",
  authorize(["admin", "manager", "user"]),
  stockOutController.getStockOutById
);

// Create a new stock out transaction
router.post(
  "/",
  authorize(["admin", "manager", "user"]),
  stockOutController.createStockOut
);

// Delete stock out transaction
router.delete("/:id", authorize(["admin"]), stockOutController.deleteStockOut);

export default router;
