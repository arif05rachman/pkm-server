import { Request, Response } from "express";
import { LogActivityModel } from "@/models/LogActivity";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  LogActivity,
  CreateLogActivityRequest,
} from "@/types";

/**
 * Create a new log activity (usually called internally, not by API)
 */
export const createLogActivity = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id_user, aksi, deskripsi, ip_address, waktu } =
      req.body as CreateLogActivityRequest;

    // Validate required fields
    if (!aksi) {
      throw new AppError("Aksi wajib diisi", 400);
    }

    // Get IP from request if not provided
    const clientIp =
      ip_address ||
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      undefined;

    const log = await LogActivityModel.create({
      id_user,
      aksi,
      deskripsi,
      ip_address: clientIp || undefined,
      waktu,
    });

    const response: ApiResponse<LogActivity> = {
      success: true,
      message: "Log activity berhasil dibuat",
      data: log,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all log activities with pagination and filters
 */
export const getAllLogActivities = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const id_user =
      req.query.id_user !== undefined
        ? parseInt(req.query.id_user as string)
        : undefined;
    const aksi = req.query.aksi as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const ip_address = req.query.ip_address as string | undefined;

    if (id_user !== undefined && isNaN(id_user)) {
      throw new AppError("ID user tidak valid", 400);
    }

    const result = await LogActivityModel.findAll(
      page,
      limit,
      id_user,
      aksi,
      startDate,
      endDate,
      ip_address
    );

    const response: PaginatedResponse<LogActivity> = {
      data: result.logs,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Data log activity berhasil diambil",
      data: response,
    });
  }
);

/**
 * Search log activities
 */
export const searchLogActivities = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const searchTerm = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!searchTerm) {
      throw new AppError("Parameter pencarian (q) wajib diisi", 400);
    }

    const result = await LogActivityModel.search(searchTerm, page, limit);

    const response: PaginatedResponse<LogActivity> = {
      data: result.logs,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Hasil pencarian log activity",
      data: response,
    });
  }
);

/**
 * Get log activity by ID
 */
export const getLogActivityById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_log = parseInt(req.params.id);

    if (isNaN(id_log)) {
      throw new AppError("ID log tidak valid", 400);
    }

    const log = await LogActivityModel.findById(id_log);
    if (!log) {
      throw new AppError("Log activity tidak ditemukan", 404);
    }

    const response: ApiResponse<LogActivity> = {
      success: true,
      message: "Data log activity berhasil diambil",
      data: log,
    };

    res.json(response);
  }
);

/**
 * Get logs by user ID
 */
export const getLogsByUserId = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_user = parseInt(req.params.userId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (isNaN(id_user)) {
      throw new AppError("ID user tidak valid", 400);
    }

    const result = await LogActivityModel.findByUserId(id_user, page, limit);

    const response: PaginatedResponse<LogActivity> = {
      data: result.logs,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Data log activity user berhasil diambil",
      data: response,
    });
  }
);

/**
 * Get log statistics
 */
export const getLogStatistics = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const statistics = await LogActivityModel.getStatistics(startDate, endDate);

    res.json({
      success: true,
      message: "Statistik log activity",
      data: statistics,
    });
  }
);

/**
 * Delete old logs (admin only)
 */
export const deleteOldLogs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const daysOld = parseInt(req.query.daysOld as string) || 90;

    if (daysOld < 1) {
      throw new AppError("Days old harus lebih besar dari 0", 400);
    }

    const deletedCount = await LogActivityModel.deleteOldLogs(daysOld);

    res.json({
      success: true,
      message: `Berhasil menghapus ${deletedCount} log lama (lebih dari ${daysOld} hari)`,
      data: { deletedCount },
    });
  }
);

