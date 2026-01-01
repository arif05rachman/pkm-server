import { Request, Response } from "express";
import { StockOutModel } from "@/models/StockOut";
import { ProductModel } from "@/models/Product";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  StockOutWithDetails,
  CreateStockOutRequest,
} from "@/types";

/**
 * Create a new stock out transaction
 */
export const createStockOut = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { date, destination, description, details } =
      req.body as CreateStockOutRequest;

    // Get user id from authenticated request (assuming user is logged in)
    const user_id = (req as any).user?.id || 1; // Fallback for testing

    // Basic validation
    if (!date || !destination || !details || details.length === 0) {
      throw new AppError("Date, destination, and details are required", 400);
    }

    // Validate if products exist and have sufficient stock
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

      if (product.stock < detail.quantity) {
        throw new AppError(
          `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${detail.quantity}`,
          400
        );
      }
    }

    const stockOut = await StockOutModel.create({
      date,
      destination,
      user_id,
      description,
      details,
    });

    const response: ApiResponse<StockOutWithDetails> = {
      success: true,
      message: "Stock out transaction created successfully",
      data: stockOut,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all stock out transactions with pagination
 */
export const getAllStockOut = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await StockOutModel.findAll(page, limit);

    const response: PaginatedResponse<any> = {
      data: result.stockOuts,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Stock out transactions retrieved successfully",
      data: response,
    });
  }
);

/**
 * Get stock out transaction by ID with details
 */
export const getStockOutById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("Invalid transaction ID", 400);
    }

    const stockOut = await StockOutModel.findById(id);
    if (!stockOut) {
      throw new AppError("Stock out transaction not found", 404);
    }

    const response: ApiResponse<StockOutWithDetails> = {
      success: true,
      message: "Stock out transaction details retrieved successfully",
      data: stockOut,
    };

    res.json(response);
  }
);

/**
 * Delete stock out transaction
 */
export const deleteStockOut = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("Invalid transaction ID", 400);
    }

    const existingStockOut = await StockOutModel.findById(id);
    if (!existingStockOut) {
      throw new AppError("Stock out transaction not found", 404);
    }

    const success = await StockOutModel.delete(id);
    if (!success) {
      throw new AppError("Failed to delete stock out transaction", 500);
    }

    res.json({
      success: true,
      message: "Stock out transaction deleted and stock reversed successfully",
    });
  }
);
