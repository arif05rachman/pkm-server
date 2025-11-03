import { Request, Response } from "express";
import {
  TransaksiMasukModel,
  DetailTransaksiMasukModel,
} from "@/models/TransaksiMasuk";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  TransaksiMasuk,
  TransaksiMasukWithDetails,
  CreateTransaksiMasukRequest,
  UpdateTransaksiMasukRequest,
  CreateDetailTransaksiMasukRequest,
  UpdateDetailTransaksiMasukRequest,
  DetailTransaksiMasuk,
  AuthenticatedRequest,
} from "@/types";

/**
 * Create a new transaksi masuk with details
 */
export const createTransaksiMasuk = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {
      tanggal_masuk,
      id_supplier,
      keterangan,
      details,
    } = req.body as CreateTransaksiMasukRequest;

    // Validate required fields
    if (!tanggal_masuk || !details || details.length === 0) {
      throw new AppError(
        "Tanggal masuk dan detail transaksi wajib diisi",
        400
      );
    }

    // Validate details
    for (const detail of details) {
      if (!detail.id_barang || !detail.jumlah || detail.harga_satuan === undefined) {
        throw new AppError(
          "Setiap detail harus memiliki id_barang, jumlah, dan harga_satuan",
          400
        );
      }

      if (detail.jumlah <= 0) {
        throw new AppError("Jumlah harus lebih besar dari 0", 400);
      }

      if (detail.harga_satuan < 0) {
        throw new AppError("Harga satuan tidak boleh negatif", 400);
      }
    }

    // Use authenticated user's ID
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("User tidak terautentikasi", 401);
    }

    const transaksi = await TransaksiMasukModel.create(
      {
        tanggal_masuk,
        id_supplier,
        id_user: userId,
        keterangan,
        details,
      },
      userId
    );

    const response: ApiResponse<TransaksiMasukWithDetails> = {
      success: true,
      message: "Transaksi masuk berhasil dibuat",
      data: transaksi,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all transaksi masuk with pagination
 */
export const getAllTransaksiMasuk = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const id_supplier =
      req.query.id_supplier !== undefined
        ? parseInt(req.query.id_supplier as string)
        : undefined;

    if (id_supplier !== undefined && isNaN(id_supplier)) {
      throw new AppError("ID supplier tidak valid", 400);
    }

    const result = await TransaksiMasukModel.findAll(
      page,
      limit,
      startDate,
      endDate,
      id_supplier
    );

    const response: PaginatedResponse<TransaksiMasuk> = {
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
      message: "Data transaksi masuk berhasil diambil",
      data: response,
    });
  }
);

/**
 * Get transaksi masuk by ID with details
 */
export const getTransaksiMasukById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_transaksi_masuk = parseInt(req.params.id);

    if (isNaN(id_transaksi_masuk)) {
      throw new AppError("ID transaksi masuk tidak valid", 400);
    }

    const transaksi = await TransaksiMasukModel.findById(id_transaksi_masuk);
    if (!transaksi) {
      throw new AppError("Transaksi masuk tidak ditemukan", 404);
    }

    const response: ApiResponse<TransaksiMasukWithDetails> = {
      success: true,
      message: "Data transaksi masuk berhasil diambil",
      data: transaksi,
    };

    res.json(response);
  }
);

/**
 * Update transaksi masuk
 */
export const updateTransaksiMasukById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_transaksi_masuk = parseInt(req.params.id);
    const { tanggal_masuk, id_supplier, keterangan } =
      req.body as UpdateTransaksiMasukRequest;

    if (isNaN(id_transaksi_masuk)) {
      throw new AppError("ID transaksi masuk tidak valid", 400);
    }

    const existingTransaksi = await TransaksiMasukModel.findById(
      id_transaksi_masuk
    );
    if (!existingTransaksi) {
      throw new AppError("Transaksi masuk tidak ditemukan", 404);
    }

    const updateData: UpdateTransaksiMasukRequest = {};
    if (tanggal_masuk !== undefined) updateData.tanggal_masuk = tanggal_masuk;
    if (id_supplier !== undefined) updateData.id_supplier = id_supplier;
    if (keterangan !== undefined) updateData.keterangan = keterangan;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Tidak ada data yang akan diupdate", 400);
    }

    const updatedTransaksi = await TransaksiMasukModel.update(
      id_transaksi_masuk,
      updateData
    );
    if (!updatedTransaksi) {
      throw new AppError("Gagal mengupdate transaksi masuk", 500);
    }

    // Get updated transaksi with details
    const transaksiWithDetails = await TransaksiMasukModel.findById(
      id_transaksi_masuk
    );

    const response: ApiResponse<TransaksiMasukWithDetails> = {
      success: true,
      message: "Transaksi masuk berhasil diupdate",
      data: transaksiWithDetails!,
    };

    res.json(response);
  }
);

/**
 * Delete transaksi masuk
 */
export const deleteTransaksiMasukById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_transaksi_masuk = parseInt(req.params.id);

    if (isNaN(id_transaksi_masuk)) {
      throw new AppError("ID transaksi masuk tidak valid", 400);
    }

    const transaksi = await TransaksiMasukModel.findById(id_transaksi_masuk);
    if (!transaksi) {
      throw new AppError("Transaksi masuk tidak ditemukan", 404);
    }

    const success = await TransaksiMasukModel.delete(id_transaksi_masuk);
    if (!success) {
      throw new AppError("Gagal menghapus transaksi masuk", 500);
    }

    res.json({
      success: true,
      message: "Transaksi masuk berhasil dihapus",
    });
  }
);

/**
 * Add detail to transaksi masuk
 */
export const addDetailTransaksiMasuk = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_transaksi_masuk = parseInt(req.params.id);
    const detailData = req.body as CreateDetailTransaksiMasukRequest;

    if (isNaN(id_transaksi_masuk)) {
      throw new AppError("ID transaksi masuk tidak valid", 400);
    }

    // Validate
    if (!detailData.id_barang || !detailData.jumlah || detailData.harga_satuan === undefined) {
      throw new AppError(
        "id_barang, jumlah, dan harga_satuan wajib diisi",
        400
      );
    }

    if (detailData.jumlah <= 0) {
      throw new AppError("Jumlah harus lebih besar dari 0", 400);
    }

    if (detailData.harga_satuan < 0) {
      throw new AppError("Harga satuan tidak boleh negatif", 400);
    }

    // Check if transaksi exists
    const transaksi = await TransaksiMasukModel.findById(id_transaksi_masuk);
    if (!transaksi) {
      throw new AppError("Transaksi masuk tidak ditemukan", 404);
    }

    const detail = await DetailTransaksiMasukModel.create(
      id_transaksi_masuk,
      detailData
    );

    const response: ApiResponse<DetailTransaksiMasuk> = {
      success: true,
      message: "Detail transaksi masuk berhasil ditambahkan",
      data: detail,
    };

    res.status(201).json(response);
  }
);

/**
 * Update detail transaksi masuk
 */
export const updateDetailTransaksiMasukById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_detail_masuk = parseInt(req.params.detailId);
    const updateData = req.body as UpdateDetailTransaksiMasukRequest;

    if (isNaN(id_detail_masuk)) {
      throw new AppError("ID detail tidak valid", 400);
    }

    const existingDetail = await DetailTransaksiMasukModel.findById(
      id_detail_masuk
    );
    if (!existingDetail) {
      throw new AppError("Detail transaksi masuk tidak ditemukan", 404);
    }

    // Validate if updating
    if (updateData.jumlah !== undefined && updateData.jumlah <= 0) {
      throw new AppError("Jumlah harus lebih besar dari 0", 400);
    }

    if (updateData.harga_satuan !== undefined && updateData.harga_satuan < 0) {
      throw new AppError("Harga satuan tidak boleh negatif", 400);
    }

    const updatedDetail = await DetailTransaksiMasukModel.update(
      id_detail_masuk,
      updateData
    );
    if (!updatedDetail) {
      throw new AppError("Gagal mengupdate detail transaksi masuk", 500);
    }

    const response: ApiResponse<DetailTransaksiMasuk> = {
      success: true,
      message: "Detail transaksi masuk berhasil diupdate",
      data: updatedDetail,
    };

    res.json(response);
  }
);

/**
 * Delete detail transaksi masuk
 */
export const deleteDetailTransaksiMasukById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_detail_masuk = parseInt(req.params.detailId);

    if (isNaN(id_detail_masuk)) {
      throw new AppError("ID detail tidak valid", 400);
    }

    const detail = await DetailTransaksiMasukModel.findById(id_detail_masuk);
    if (!detail) {
      throw new AppError("Detail transaksi masuk tidak ditemukan", 404);
    }

    const success = await DetailTransaksiMasukModel.delete(id_detail_masuk);
    if (!success) {
      throw new AppError("Gagal menghapus detail transaksi masuk", 500);
    }

    res.json({
      success: true,
      message: "Detail transaksi masuk berhasil dihapus",
    });
  }
);

