import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import employeeRoutes from "./employees";
import productRoutes from "./products";
import categoryRoutes from "./categories";
import supplierRoutes from "./supplier";
import stockInRoutes from "./stockIn";
import stockOutRoutes from "./stockOut";
import reportRoutes from "./report";

const router: Router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/employees", employeeRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/stock-in", stockInRoutes);
router.use("/stock-out", stockOutRoutes);
router.use("/reports", reportRoutes);

// API documentation endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inventory Management API",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        refresh: "POST /api/auth/refresh",
        logout: "POST /api/auth/logout",
        logoutAll: "POST /api/auth/logout-all",
        profile: "GET /api/auth/profile",
        updateProfile: "PUT /api/auth/profile",
        changePassword: "PUT /api/auth/change-password",
      },
      users: {
        getAll: "GET /api/users",
        getById: "GET /api/users/:id",
        updateById: "PUT /api/users/:id",
        deleteById: "DELETE /api/users/:id",
      },
      employees: {
        getAll: "GET /api/employees",
        getById: "GET /api/employees/:id",
        create: "POST /api/employees",
        updateById: "PUT /api/employees/:id",
        deleteById: "DELETE /api/employees/:id",
      },
      products: {
        getAll: "GET /api/products",
        search: "GET /api/products/search?q=searchTerm",
        getById: "GET /api/products/:id",
        create: "POST /api/products",
        updateById: "PUT /api/products/:id",
        deleteById: "DELETE /api/products/:id",
      },
      categories: {
        getAll: "GET /api/categories",
        search: "GET /api/categories/search?q=searchTerm",
        getById: "GET /api/categories/:id",
        create: "POST /api/categories",
        updateById: "PUT /api/categories/:id",
        deleteById: "DELETE /api/categories/:id",
      },
      suppliers: {
        getAll: "GET /api/suppliers",
        getById: "GET /api/suppliers/:id",
        create: "POST /api/suppliers",
        updateById: "PUT /api/suppliers/:id",
        deleteById: "DELETE /api/suppliers/:id",
      },
      stockIn: {
        getAll: "GET /api/stock-in",
        getById: "GET /api/stock-in/:id",
        create: "POST /api/stock-in",
        deleteById: "DELETE /api/stock-in/:id",
      },
      stockOut: {
        getAll: "GET /api/stock-out",
        getById: "GET /api/stock-out/:id",
        create: "POST /api/stock-out",
        deleteById: "DELETE /api/stock-out/:id",
      },
      reports: {
        stockLevel: "GET /api/reports/stock-level",
        transactions: "GET /api/reports/transactions",
      },
    },
  });
});

export default router;
