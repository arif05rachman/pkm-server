import { Request, Response } from "express";
import { BarangModel } from "@/models/Barang";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  Barang,
  CreateBarangRequest,
  UpdateBarangRequest,
} from "@/types";

/**
 * Create a new barang
 */
export const createBarang = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { nama_barang, satuan, jenis, stok_minimal, lokasi } =
      req.body as CreateBarangRequest;

    // Validate required fields
    if (!nama_barang || !satuan || !jenis) {
      throw new AppError(
        "Nama barang, satuan, dan jenis wajib diisi",
        400
      );
    }

    // Validate satuan
    if (!["pcs", "botol", "tablet"].includes(satuan)) {
      throw new AppError(
        "Satuan harus salah satu dari: pcs, botol, tablet",
        400
      );
    }

    // Validate jenis
    if (!["Obat", "Alkes", "BMHP"].includes(jenis)) {
      throw new AppError(
        "Jenis harus salah satu dari: Obat, Alkes, BMHP",
        400
      );
    }

    // Validate stok_minimal
    if (stok_minimal !== undefined && stok_minimal < 0) {
      throw new AppError("Stok minimal tidak boleh negatif", 400);
    }

    const barang = await BarangModel.create({
      nama_barang,
      satuan,
      jenis,
      stok_minimal: stok_minimal || 0,
      lokasi,
    });

    const response: ApiResponse<Barang> = {
      success: true,
      message: "Barang berhasil dibuat",
      data: barang,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all barang with pagination and filters
 */
export const getAllBarang = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const jenis = req.query.jenis as string | undefined;
    const satuan = req.query.satuan as string | undefined;

    // Validate jenis if provided
    if (jenis && !["Obat", "Alkes", "BMHP"].includes(jenis)) {
      throw new AppError(
        "Jenis harus salah satu dari: Obat, Alkes, BMHP",
        400
      );
    }

    // Validate satuan if provided
    if (satuan && !["pcs", "botol", "tablet"].includes(satuan)) {
      throw new AppError(
        "Satuan harus salah satu dari: pcs, botol, tablet",
        400
      );
    }

    const result = await BarangModel.findAll(page, limit, jenis, satuan);

    const response: PaginatedResponse<Barang> = {
      data: result.barang,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Data barang berhasil diambil",
      data: response,
    });
  }
);

/**
 * Search barang by name or location
 */
export const searchBarang = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const searchTerm = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!searchTerm) {
      throw new AppError("Parameter pencarian (q) wajib diisi", 400);
    }

    const result = await BarangModel.search(searchTerm, page, limit);

    const response: PaginatedResponse<Barang> = {
      data: result.barang,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Hasil pencarian barang",
      data: response,
    });
  }
);

/**
 * Get barang by ID
 */
export const getBarangById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_barang = parseInt(req.params.id);

    if (isNaN(id_barang)) {
      throw new AppError("ID barang tidak valid", 400);
    }

    const barang = await BarangModel.findById(id_barang);
    if (!barang) {
      throw new AppError("Barang tidak ditemukan", 404);
    }

    const response: ApiResponse<Barang> = {
      success: true,
      message: "Data barang berhasil diambil",
      data: barang,
    };

    res.json(response);
  }
);

/**
 * Update barang by ID
 */
export const updateBarangById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_barang = parseInt(req.params.id);
    const { nama_barang, satuan, jenis, stok_minimal, lokasi } =
      req.body as UpdateBarangRequest;

    if (isNaN(id_barang)) {
      throw new AppError("ID barang tidak valid", 400);
    }

    const existingBarang = await BarangModel.findById(id_barang);
    if (!existingBarang) {
      throw new AppError("Barang tidak ditemukan", 404);
    }

    // Validate satuan if provided
    if (satuan && !["pcs", "botol", "tablet"].includes(satuan)) {
      throw new AppError(
        "Satuan harus salah satu dari: pcs, botol, tablet",
        400
      );
    }

    // Validate jenis if provided
    if (jenis && !["Obat", "Alkes", "BMHP"].includes(jenis)) {
      throw new AppError(
        "Jenis harus salah satu dari: Obat, Alkes, BMHP",
        400
      );
    }

    // Validate stok_minimal if provided
    if (stok_minimal !== undefined && stok_minimal < 0) {
      throw new AppError("Stok minimal tidak boleh negatif", 400);
    }

    const updateData: UpdateBarangRequest = {};
    if (nama_barang !== undefined) updateData.nama_barang = nama_barang;
    if (satuan !== undefined) updateData.satuan = satuan;
    if (jenis !== undefined) updateData.jenis = jenis;
    if (stok_minimal !== undefined) updateData.stok_minimal = stok_minimal;
    if (lokasi !== undefined) updateData.lokasi = lokasi;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Tidak ada data yang akan diupdate", 400);
    }

    const updatedBarang = await BarangModel.update(id_barang, updateData);
    if (!updatedBarang) {
      throw new AppError("Gagal mengupdate barang", 500);
    }

    const response: ApiResponse<Barang> = {
      success: true,
      message: "Barang berhasil diupdate",
      data: updatedBarang,
    };

    res.json(response);
  }
);

/**
 * Delete barang by ID
 */
export const deleteBarangById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_barang = parseInt(req.params.id);

    if (isNaN(id_barang)) {
      throw new AppError("ID barang tidak valid", 400);
    }

    const barang = await BarangModel.findById(id_barang);
    if (!barang) {
      throw new AppError("Barang tidak ditemukan", 404);
    }

    const success = await BarangModel.delete(id_barang);
    if (!success) {
      throw new AppError("Gagal menghapus barang", 500);
    }

    res.json({
      success: true,
      message: "Barang berhasil dihapus",
    });
  }
);

