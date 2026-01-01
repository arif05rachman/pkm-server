import { Router } from "express";
import * as supplierController from "@/controllers/supplierController";
import { authenticate, authorize } from "@/middleware/auth";

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Get all suppliers
router.get("/", supplierController.getAllSuppliers);

// Get supplier by ID
router.get("/:id", supplierController.getSupplierById);

// Create a new supplier
router.post(
  "/",
  authorize(["admin", "manager"]),
  supplierController.createSupplier
);

// Update supplier by ID
router.put(
  "/:id",
  authorize(["admin", "manager"]),
  supplierController.updateSupplierById
);

// Delete supplier by ID
router.delete(
  "/:id",
  authorize(["admin"]),
  supplierController.deleteSupplierById
);

export default router;
