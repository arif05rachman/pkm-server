import { Request, Response } from "express";
import { SupplierModel } from "@/models/Supplier";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "@/types";

/**
 * Create a new supplier
 */
export const createSupplier = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { nama_supplier, alamat, kontak } =
      req.body as CreateSupplierRequest;

    // Validate required fields
    if (!nama_supplier) {
      throw new AppError("Nama supplier wajib diisi", 400);
    }

    // Check if nama_supplier already exists
    const existingSupplier = await SupplierModel.namaSupplierExists(nama_supplier);
    if (existingSupplier) {
      throw new AppError("Nama supplier sudah terdaftar", 409);
    }

    const supplier = await SupplierModel.create({
      nama_supplier,
      alamat,
      kontak,
    });

    const response: ApiResponse<Supplier> = {
      success: true,
      message: "Supplier berhasil dibuat",
      data: supplier,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all supplier with pagination
 */
export const getAllSupplier = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SupplierModel.findAll(page, limit);

    const response: PaginatedResponse<Supplier> = {
      data: result.supplier,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Data supplier berhasil diambil",
      data: response,
    });
  }
);

/**
 * Search supplier by name, alamat, or kontak
 */
export const searchSupplier = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const searchTerm = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!searchTerm) {
      throw new AppError("Parameter pencarian (q) wajib diisi", 400);
    }

    const result = await SupplierModel.search(searchTerm, page, limit);

    const response: PaginatedResponse<Supplier> = {
      data: result.supplier,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Hasil pencarian supplier",
      data: response,
    });
  }
);

/**
 * Get supplier by ID
 */
export const getSupplierById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_supplier = parseInt(req.params.id);

    if (isNaN(id_supplier)) {
      throw new AppError("ID supplier tidak valid", 400);
    }

    const supplier = await SupplierModel.findById(id_supplier);
    if (!supplier) {
      throw new AppError("Supplier tidak ditemukan", 404);
    }

    const response: ApiResponse<Supplier> = {
      success: true,
      message: "Data supplier berhasil diambil",
      data: supplier,
    };

    res.json(response);
  }
);

/**
 * Update supplier by ID
 */
export const updateSupplierById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_supplier = parseInt(req.params.id);
    const { nama_supplier, alamat, kontak } =
      req.body as UpdateSupplierRequest;

    if (isNaN(id_supplier)) {
      throw new AppError("ID supplier tidak valid", 400);
    }

    const existingSupplier = await SupplierModel.findById(id_supplier);
    if (!existingSupplier) {
      throw new AppError("Supplier tidak ditemukan", 404);
    }

    // Check if nama_supplier is already taken by another supplier
    if (nama_supplier && nama_supplier !== existingSupplier.nama_supplier) {
      const namaExists = await SupplierModel.namaSupplierExists(nama_supplier, id_supplier);
      if (namaExists) {
        throw new AppError("Nama supplier sudah digunakan oleh supplier lain", 409);
      }
    }

    const updateData: UpdateSupplierRequest = {};
    if (nama_supplier !== undefined) updateData.nama_supplier = nama_supplier;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (kontak !== undefined) updateData.kontak = kontak;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Tidak ada data yang akan diupdate", 400);
    }

    const updatedSupplier = await SupplierModel.update(id_supplier, updateData);
    if (!updatedSupplier) {
      throw new AppError("Gagal mengupdate supplier", 500);
    }

    const response: ApiResponse<Supplier> = {
      success: true,
      message: "Supplier berhasil diupdate",
      data: updatedSupplier,
    };

    res.json(response);
  }
);

/**
 * Delete supplier by ID
 */
export const deleteSupplierById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id_supplier = parseInt(req.params.id);

    if (isNaN(id_supplier)) {
      throw new AppError("ID supplier tidak valid", 400);
    }

    const supplier = await SupplierModel.findById(id_supplier);
    if (!supplier) {
      throw new AppError("Supplier tidak ditemukan", 404);
    }

    const success = await SupplierModel.delete(id_supplier);
    if (!success) {
      throw new AppError("Gagal menghapus supplier", 500);
    }

    res.json({
      success: true,
      message: "Supplier berhasil dihapus",
    });
  }
);

