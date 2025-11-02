import { Request, Response } from "express";
import {
  TransaksiKeluarModel,
  DetailTransaksiKeluarModel,
} from "@/models/TransaksiKeluar";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  TransaksiKeluar,
  TransaksiKeluarWithDetails,
  CreateTransaksiKeluarRequest,
  UpdateTransaksiKeluarRequest,
  CreateDetailTransaksiKeluarRequest,
  UpdateDetailTransaksiKeluarRequest,
  DetailTransaksiKeluar,
  AuthenticatedRequest,
} from "@/types";

/**
 * Create a new transaksi keluar with details
 */
export const createTransaksiKeluar = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { tanggal_keluar, tujuan, keterangan, details } =
      req.body as CreateTransaksiKeluarRequest;

    // Validate required fields
    if (!tanggal_keluar || !tujuan || !details || details.length === 0) {
      throw new AppError(
        "Tanggal keluar, tujuan, dan detail transaksi wajib diisi",
        400
      );
    }

    // Validate details
    for (const detail of details) {
      if (!detail.id_barang || !detail.jumlah) {
        throw new AppError(
          "Setiap detail harus memiliki id_barang dan jumlah",
          400
        );
      }

      if (detail.jumlah <= 0) {
        throw new AppError("Jumlah harus lebih besar dari 0", 400);
      }
    }

    // Use authenticated user's ID
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("User tidak terautentikasi", 401);
    }

    const transaksi = await TransaksiKeluarModel.create(
      {
        tanggal_keluar,
        tujuan,
        id_user: userId,
        keterangan,
        details,
      },
      userId
    );

    const response: ApiResponse<TransaksiKeluarWithDetails> = {
      success: true,
      message: "Transaksi keluar berhasil dibuat",
      data: transaksi,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all transaksi keluar with pagination
 */
export const getAllTransaksiKeluar = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const tujuan = req.query.tujuan as string | undefined;

    const result = await TransaksiKeluarModel.findAll(
      page,
      limit,
      startDate,
      endDate,
      tujuan
    );

    const response: PaginatedResponse<TransaksiKeluar> = {
      data: result.transaksi,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Data transaksi keluar berhasil diambil",
      data: response,
    });
  }
);

/**
 * Get transaksi keluar by ID with details
 */
export const getTransaksiKeluarById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_transaksi_keluar = parseInt(req.params.id);

    if (isNaN(id_transaksi_keluar)) {
      throw new AppError("ID transaksi keluar tidak valid", 400);
    }

    const transaksi = await TransaksiKeluarModel.findById(
      id_transaksi_keluar
    );
    if (!transaksi) {
      throw new AppError("Transaksi keluar tidak ditemukan", 404);
    }

    const response: ApiResponse<TransaksiKeluarWithDetails> = {
      success: true,
      message: "Data transaksi keluar berhasil diambil",
      data: transaksi,
    };

    res.json(response);
  }
);

/**
 * Update transaksi keluar
 */
export const updateTransaksiKeluarById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_transaksi_keluar = parseInt(req.params.id);
    const { tanggal_keluar, tujuan, keterangan } =
      req.body as UpdateTransaksiKeluarRequest;

    if (isNaN(id_transaksi_keluar)) {
      throw new AppError("ID transaksi keluar tidak valid", 400);
    }

    const existingTransaksi = await TransaksiKeluarModel.findById(
      id_transaksi_keluar
    );
    if (!existingTransaksi) {
      throw new AppError("Transaksi keluar tidak ditemukan", 404);
    }

    const updateData: UpdateTransaksiKeluarRequest = {};
    if (tanggal_keluar !== undefined) updateData.tanggal_keluar = tanggal_keluar;
    if (tujuan !== undefined) updateData.tujuan = tujuan;
    if (keterangan !== undefined) updateData.keterangan = keterangan;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Tidak ada data yang akan diupdate", 400);
    }

    const updatedTransaksi = await TransaksiKeluarModel.update(
      id_transaksi_keluar,
      updateData
    );
    if (!updatedTransaksi) {
      throw new AppError("Gagal mengupdate transaksi keluar", 500);
    }

    // Get updated transaksi with details
    const transaksiWithDetails = await TransaksiKeluarModel.findById(
      id_transaksi_keluar
    );

    const response: ApiResponse<TransaksiKeluarWithDetails> = {
      success: true,
      message: "Transaksi keluar berhasil diupdate",
      data: transaksiWithDetails!,
    };

    res.json(response);
  }
);

/**
 * Delete transaksi keluar
 */
export const deleteTransaksiKeluarById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_transaksi_keluar = parseInt(req.params.id);

    if (isNaN(id_transaksi_keluar)) {
      throw new AppError("ID transaksi keluar tidak valid", 400);
    }

    const transaksi = await TransaksiKeluarModel.findById(id_transaksi_keluar);
    if (!transaksi) {
      throw new AppError("Transaksi keluar tidak ditemukan", 404);
    }

    const success = await TransaksiKeluarModel.delete(id_transaksi_keluar);
    if (!success) {
      throw new AppError("Gagal menghapus transaksi keluar", 500);
    }

    res.json({
      success: true,
      message: "Transaksi keluar berhasil dihapus",
    });
  }
);

/**
 * Add detail to transaksi keluar
 */
export const addDetailTransaksiKeluar = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_transaksi_keluar = parseInt(req.params.id);
    const detailData = req.body as CreateDetailTransaksiKeluarRequest;

    if (isNaN(id_transaksi_keluar)) {
      throw new AppError("ID transaksi keluar tidak valid", 400);
    }

    // Validate
    if (!detailData.id_barang || !detailData.jumlah) {
      throw new AppError("id_barang dan jumlah wajib diisi", 400);
    }

    if (detailData.jumlah <= 0) {
      throw new AppError("Jumlah harus lebih besar dari 0", 400);
    }

    // Check if transaksi exists
    const transaksi = await TransaksiKeluarModel.findById(id_transaksi_keluar);
    if (!transaksi) {
      throw new AppError("Transaksi keluar tidak ditemukan", 404);
    }

    const detail = await DetailTransaksiKeluarModel.create(
      id_transaksi_keluar,
      detailData
    );

    const response: ApiResponse<DetailTransaksiKeluar> = {
      success: true,
      message: "Detail transaksi keluar berhasil ditambahkan",
      data: detail,
    };

    res.status(201).json(response);
  }
);

/**
 * Update detail transaksi keluar
 */
export const updateDetailTransaksiKeluarById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_detail_keluar = parseInt(req.params.detailId);
    const updateData = req.body as UpdateDetailTransaksiKeluarRequest;

    if (isNaN(id_detail_keluar)) {
      throw new AppError("ID detail tidak valid", 400);
    }

    const existingDetail = await DetailTransaksiKeluarModel.findById(
      id_detail_keluar
    );
    if (!existingDetail) {
      throw new AppError("Detail transaksi keluar tidak ditemukan", 404);
    }

    // Validate if updating
    if (updateData.jumlah !== undefined && updateData.jumlah <= 0) {
      throw new AppError("Jumlah harus lebih besar dari 0", 400);
    }

    const updatedDetail = await DetailTransaksiKeluarModel.update(
      id_detail_keluar,
      updateData
    );
    if (!updatedDetail) {
      throw new AppError("Gagal mengupdate detail transaksi keluar", 500);
    }

    const response: ApiResponse<DetailTransaksiKeluar> = {
      success: true,
      message: "Detail transaksi keluar berhasil diupdate",
      data: updatedDetail,
    };

    res.json(response);
  }
);

/**
 * Delete detail transaksi keluar
 */
export const deleteDetailTransaksiKeluarById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_detail_keluar = parseInt(req.params.detailId);

    if (isNaN(id_detail_keluar)) {
      throw new AppError("ID detail tidak valid", 400);
    }

    const detail = await DetailTransaksiKeluarModel.findById(id_detail_keluar);
    if (!detail) {
      throw new AppError("Detail transaksi keluar tidak ditemukan", 404);
    }

    const success = await DetailTransaksiKeluarModel.delete(id_detail_keluar);
    if (!success) {
      throw new AppError("Gagal menghapus detail transaksi keluar", 500);
    }

    res.json({
      success: true,
      message: "Detail transaksi keluar berhasil dihapus",
    });
  }
);

