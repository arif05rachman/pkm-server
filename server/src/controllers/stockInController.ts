import { Request, Response } from "express";
import { StockInModel } from "@/models/StockIn";
import { ProductModel } from "@/models/Product";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  StockInWithDetails,
  CreateStockInRequest,
} from "@/types";

/**
 * Create a new stock in transaction
 */
export const createStockIn = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { date, supplier_id, description, details } =
      req.body as CreateStockInRequest;

    // Get user id from authenticated request (assuming user is logged in)
    const user_id = (req as any).user?.id || 1; // Fallback for testing

    // Basic validation
    if (!date || !details || details.length === 0) {
      throw new AppError("Date and transaction details are required", 400);
    }

    // Validate if products exist
    for (const detail of details) {
      const product = await ProductModel.findById(detail.product_id);
      if (!product) {
        throw new AppError(
          `Product with ID ${detail.product_id} not found`,
          404
        );
      }
      if (detail.quantity <= 0) {
        throw new AppError("Quantity must be greater than 0", 400);
      }
    }

    const stockIn = await StockInModel.create({
      date,
      supplier_id,
      user_id,
      description,
      details,
    });

    const response: ApiResponse<StockInWithDetails> = {
      success: true,
      message: "Stock in transaction created successfully",
      data: stockIn,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all stock in transactions with pagination
 */
export const getAllStockIn = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await StockInModel.findAll(page, limit);

    const response: PaginatedResponse<any> = {
      data: result.stockIns,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Stock in transactions retrieved successfully",
      data: response,
    });
  }
);

/**
 * Get stock in transaction by ID with details
 */
export const getStockInById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("Invalid transaction ID", 400);
    }

    const stockIn = await StockInModel.findById(id);
    if (!stockIn) {
      throw new AppError("Stock in transaction not found", 404);
    }

    const response: ApiResponse<StockInWithDetails> = {
      success: true,
      message: "Stock in transaction details retrieved successfully",
      data: stockIn,
    };

    res.json(response);
  }
);

/**
 * Delete stock in transaction
 */
export const deleteStockIn = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("Invalid transaction ID", 400);
    }

    const existingStockIn = await StockInModel.findById(id);
    if (!existingStockIn) {
      throw new AppError("Stock in transaction not found", 404);
    }

    const success = await StockInModel.delete(id);
    if (!success) {
      throw new AppError("Failed to delete stock in transaction", 500);
    }

    res.json({
      success: true,
      message: "Stock in transaction deleted and stock reversed successfully",
    });
  }
);
