import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import karyawanRoutes from "./karyawan";
import barangRoutes from "./barang";
import supplierRoutes from "./supplier";
import transaksiMasukRoutes from "./transaksiMasuk";
import transaksiKeluarRoutes from "./transaksiKeluar";
import logActivityRoutes from "./logActivity";

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
router.use("/karyawan", karyawanRoutes);
router.use("/barang", barangRoutes);
router.use("/supplier", supplierRoutes);
router.use("/transaksi-masuk", transaksiMasukRoutes);
router.use("/transaksi-keluar", transaksiKeluarRoutes);
router.use("/logs", logActivityRoutes);

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
      karyawan: {
        getAll: "GET /api/karyawan",
        search: "GET /api/karyawan/search?q=searchTerm",
        getById: "GET /api/karyawan/:id",
        create: "POST /api/karyawan",
        updateById: "PUT /api/karyawan/:id",
        deleteById: "DELETE /api/karyawan/:id",
        hardDelete: "DELETE /api/karyawan/:id/hard",
      },
      barang: {
        getAll: "GET /api/barang",
        search: "GET /api/barang/search?q=searchTerm",
        getById: "GET /api/barang/:id",
        create: "POST /api/barang",
        updateById: "PUT /api/barang/:id",
        deleteById: "DELETE /api/barang/:id",
      },
      supplier: {
        getAll: "GET /api/supplier",
        search: "GET /api/supplier/search?q=searchTerm",
        getById: "GET /api/supplier/:id",
        create: "POST /api/supplier",
        updateById: "PUT /api/supplier/:id",
        deleteById: "DELETE /api/supplier/:id",
      },
      transaksiMasuk: {
        getAll: "GET /api/transaksi-masuk",
        getById: "GET /api/transaksi-masuk/:id",
        create: "POST /api/transaksi-masuk",
        updateById: "PUT /api/transaksi-masuk/:id",
        deleteById: "DELETE /api/transaksi-masuk/:id",
        addDetail: "POST /api/transaksi-masuk/:id/details",
        updateDetail: "PUT /api/transaksi-masuk/:id/details/:detailId",
        deleteDetail: "DELETE /api/transaksi-masuk/:id/details/:detailId",
      },
      transaksiKeluar: {
        getAll: "GET /api/transaksi-keluar",
        getById: "GET /api/transaksi-keluar/:id",
        create: "POST /api/transaksi-keluar",
        updateById: "PUT /api/transaksi-keluar/:id",
        deleteById: "DELETE /api/transaksi-keluar/:id",
        addDetail: "POST /api/transaksi-keluar/:id/details",
        updateDetail: "PUT /api/transaksi-keluar/:id/details/:detailId",
        deleteDetail: "DELETE /api/transaksi-keluar/:id/details/:detailId",
      },
      logActivity: {
        getAll: "GET /api/logs",
        search: "GET /api/logs/search?q=searchTerm",
        getById: "GET /api/logs/:id",
        getByUserId: "GET /api/logs/user/:userId",
        getStatistics: "GET /api/logs/statistics",
        create: "POST /api/logs",
        deleteOldLogs: "DELETE /api/logs/cleanup?daysOld=90",
      },
    },
  });
});

export default router;
