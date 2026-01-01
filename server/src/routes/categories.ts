import { Router } from "express";
import * as categoryController from "@/controllers/categoryController";
import { authenticate, authorize } from "@/middleware/auth";

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Get all categories
router.get("/", categoryController.getAllCategories);

// Search categories
router.get("/search", categoryController.searchCategories);

// Get category by ID
router.get("/:id", categoryController.getCategoryById);

// Create a new category (admin and manager only)
router.post(
  "/",
  authorize(["admin", "manager"]),
  categoryController.createCategory
);

// Update category by ID (admin and manager only)
router.put(
  "/:id",
  authorize(["admin", "manager"]),
  categoryController.updateCategoryById
);

// Delete category by ID (admin only)
router.delete(
  "/:id",
  authorize(["admin"]),
  categoryController.deleteCategoryById
);

export default router;
