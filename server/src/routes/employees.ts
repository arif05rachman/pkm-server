import { Router } from "express";
import * as employeeController from "@/controllers/employeeController";
import { authenticate, authorize } from "@/middleware/auth";

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Get all employees with pagination
router.get(
  "/",
  authorize(["admin", "manager"]),
  employeeController.getAllEmployees
);

// Get employee by ID
router.get(
  "/:id",
  authorize(["admin", "manager"]),
  employeeController.getEmployeeById
);

// Create a new employee
router.post("/", authorize(["admin"]), employeeController.createEmployee);

// Update employee by ID
router.put("/:id", authorize(["admin"]), employeeController.updateEmployeeById);

// Delete employee by ID
router.delete(
  "/:id",
  authorize(["admin"]),
  employeeController.deleteEmployeeById
);

export default router;
