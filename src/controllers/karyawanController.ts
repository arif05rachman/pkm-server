import { Request, Response } from "express";
import { KaryawanModel } from "@/models/Karyawan";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  Karyawan,
  CreateKaryawanRequest,
  UpdateKaryawanRequest,
} from "@/types";

/**
 * Create a new karyawan
 */
export const createKaryawan = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { nama_karyawan, jabatan, nip, no_hp, alamat, status_aktif } =
      req.body as CreateKaryawanRequest;

    // Validate required fields
    if (!nama_karyawan || !jabatan) {
      throw new AppError("Nama karyawan dan jabatan wajib diisi", 400);
    }

    // Check if NIP already exists (if provided)
    if (nip) {
      const existingKaryawan = await KaryawanModel.nipExists(nip);
      if (existingKaryawan) {
        throw new AppError("NIP sudah terdaftar", 409);
      }
    }

    const karyawan = await KaryawanModel.create({
      nama_karyawan,
      jabatan,
      nip,
      no_hp,
      alamat,
      status_aktif,
    });

    const response: ApiResponse<Karyawan> = {
      success: true,
      message: "Karyawan berhasil dibuat",
      data: karyawan,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all karyawan with pagination
 */
export const getAllKaryawan = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status_aktif =
      req.query.status_aktif !== undefined
        ? req.query.status_aktif === "true"
        : undefined;

    const result = await KaryawanModel.findAll(page, limit, status_aktif);

    const response: PaginatedResponse<Karyawan> = {
      data: result.karyawan,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Data karyawan berhasil diambil",
      data: response,
    });
  }
);

/**
 * Search karyawan by name or NIP
 */
export const searchKaryawan = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const searchTerm = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!searchTerm) {
      throw new AppError("Parameter pencarian (q) wajib diisi", 400);
    }

    const result = await KaryawanModel.search(searchTerm, page, limit);

    const response: PaginatedResponse<Karyawan> = {
      data: result.karyawan,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Hasil pencarian karyawan",
      data: response,
    });
  }
);

/**
 * Get karyawan by ID
 */
export const getKaryawanById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_karyawan = parseInt(req.params.id);

    if (isNaN(id_karyawan)) {
      throw new AppError("ID karyawan tidak valid", 400);
    }

    const karyawan = await KaryawanModel.findById(id_karyawan);
    if (!karyawan) {
      throw new AppError("Karyawan tidak ditemukan", 404);
    }

    const response: ApiResponse<Karyawan> = {
      success: true,
      message: "Data karyawan berhasil diambil",
      data: karyawan,
    };

    res.json(response);
  }
);

/**
 * Update karyawan by ID
 */
export const updateKaryawanById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_karyawan = parseInt(req.params.id);
    const {
      nama_karyawan,
      jabatan,
      nip,
      no_hp,
      alamat,
      status_aktif,
    } = req.body as UpdateKaryawanRequest;

    if (isNaN(id_karyawan)) {
      throw new AppError("ID karyawan tidak valid", 400);
    }

    const existingKaryawan = await KaryawanModel.findById(id_karyawan);
    if (!existingKaryawan) {
      throw new AppError("Karyawan tidak ditemukan", 404);
    }

    // Check if NIP is already taken by another karyawan
    if (nip && nip !== existingKaryawan.nip) {
      const nipExists = await KaryawanModel.nipExists(nip, id_karyawan);
      if (nipExists) {
        throw new AppError("NIP sudah digunakan oleh karyawan lain", 409);
      }
    }

    const updateData: UpdateKaryawanRequest = {};
    if (nama_karyawan !== undefined) updateData.nama_karyawan = nama_karyawan;
    if (jabatan !== undefined) updateData.jabatan = jabatan;
    if (nip !== undefined) updateData.nip = nip;
    if (no_hp !== undefined) updateData.no_hp = no_hp;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (status_aktif !== undefined) updateData.status_aktif = status_aktif;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Tidak ada data yang akan diupdate", 400);
    }

    const updatedKaryawan = await KaryawanModel.update(id_karyawan, updateData);
    if (!updatedKaryawan) {
      throw new AppError("Gagal mengupdate karyawan", 500);
    }

    const response: ApiResponse<Karyawan> = {
      success: true,
      message: "Karyawan berhasil diupdate",
      data: updatedKaryawan,
    };

    res.json(response);
  }
);

/**
 * Delete karyawan by ID (soft delete)
 */
export const deleteKaryawanById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_karyawan = parseInt(req.params.id);

    if (isNaN(id_karyawan)) {
      throw new AppError("ID karyawan tidak valid", 400);
    }

    const karyawan = await KaryawanModel.findById(id_karyawan);
    if (!karyawan) {
      throw new AppError("Karyawan tidak ditemukan", 404);
    }

    const success = await KaryawanModel.delete(id_karyawan);
    if (!success) {
      throw new AppError("Gagal menghapus karyawan", 500);
    }

    res.json({
      success: true,
      message: "Karyawan berhasil dihapus",
    });
  }
);

/**
 * Hard delete karyawan by ID (permanent deletion)
 */
export const hardDeleteKaryawanById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_karyawan = parseInt(req.params.id);

    if (isNaN(id_karyawan)) {
      throw new AppError("ID karyawan tidak valid", 400);
    }

    const karyawan = await KaryawanModel.findById(id_karyawan);
    if (!karyawan) {
      throw new AppError("Karyawan tidak ditemukan", 404);
    }

    const success = await KaryawanModel.hardDelete(id_karyawan);
    if (!success) {
      throw new AppError("Gagal menghapus karyawan secara permanen", 500);
    }

    res.json({
      success: true,
      message: "Karyawan berhasil dihapus secara permanen",
    });
  }
);

