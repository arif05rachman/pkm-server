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
    const { name, address, contact } = req.body as CreateSupplierRequest;

    // Validate required fields
    if (!name) {
      throw new AppError("Supplier name is required", 400);
    }

    // Check if name already exists
    const existingSupplier = await SupplierModel.nameExists(name);
    if (existingSupplier) {
      throw new AppError("Supplier name already registered", 409);
    }

    const supplier = await SupplierModel.create({
      name,
      address,
      contact,
    });

    const response: ApiResponse<Supplier> = {
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all suppliers with pagination
 */
export const getAllSuppliers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.q as string | undefined;

    const result = await SupplierModel.findAll(page, limit, searchTerm);

    const response: PaginatedResponse<Supplier> = {
      data: result.suppliers,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Suppliers data retrieved successfully",
      data: response,
    });
  }
);

/**
 * Get supplier by ID
 */
export const getSupplierById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const supplierId = parseInt(req.params.id);

    if (isNaN(supplierId)) {
      throw new AppError("Invalid supplier ID", 400);
    }

    const supplier = await SupplierModel.findById(supplierId);
    if (!supplier) {
      throw new AppError("Supplier not found", 404);
    }

    const response: ApiResponse<Supplier> = {
      success: true,
      message: "Supplier data retrieved successfully",
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
    const supplierId = parseInt(req.params.id);
    const { name, address, contact } = req.body as UpdateSupplierRequest;

    if (isNaN(supplierId)) {
      throw new AppError("Invalid supplier ID", 400);
    }

    const existingSupplier = await SupplierModel.findById(supplierId);
    if (!existingSupplier) {
      throw new AppError("Supplier not found", 404);
    }

    // Check if name is already taken by another supplier
    if (name && name !== existingSupplier.name) {
      const nameExists = await SupplierModel.nameExists(name, supplierId);
      if (nameExists) {
        throw new AppError(
          "Supplier name already used by another supplier",
          409
        );
      }
    }

    const updateData: UpdateSupplierRequest = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (contact !== undefined) updateData.contact = contact;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No data provided to update", 400);
    }

    const updatedSupplier = await SupplierModel.update(supplierId, updateData);
    if (!updatedSupplier) {
      throw new AppError("Failed to update supplier", 500);
    }

    const response: ApiResponse<Supplier> = {
      success: true,
      message: "Supplier updated successfully",
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
    const supplierId = parseInt(req.params.id);

    if (isNaN(supplierId)) {
      throw new AppError("Invalid supplier ID", 400);
    }

    const supplier = await SupplierModel.findById(supplierId);
    if (!supplier) {
      throw new AppError("Supplier not found", 404);
    }

    const success = await SupplierModel.delete(supplierId);
    if (!success) {
      throw new AppError("Failed to delete supplier", 500);
    }

    res.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  }
);
