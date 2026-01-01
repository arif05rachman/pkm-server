import { Router } from "express";
import * as productController from "@/controllers/productController";
import { authenticate, authorize } from "@/middleware/auth";

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Get all products with pagination and filters
router.get("/", productController.getAllProducts);

// Get product by ID
router.get("/:id", productController.getProductById);

// Create a new product (admin and manager only)
router.post(
  "/",
  authorize(["admin", "manager"]),
  productController.createProduct
);

// Update product by ID (admin and manager only)
router.put(
  "/:id",
  authorize(["admin", "manager"]),
  productController.updateProductById
);

// Delete product by ID (admin only)
router.delete(
  "/:id",
  authorize(["admin"]),
  productController.deleteProductById
);

export default router;
