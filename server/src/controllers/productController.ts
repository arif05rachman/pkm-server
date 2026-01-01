import { Request, Response } from "express";
import { ProductModel } from "@/models/Product";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types";

/**
 * Create a new product
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, unit, category_id, min_stock, location } =
      req.body as CreateProductRequest;

    // Validate required fields
    if (!name || !unit) {
      throw new AppError("Product name and unit are required", 400);
    }

    // Validate unit
    if (!["pcs", "bottle", "tablet"].includes(unit)) {
      throw new AppError("Unit must be one of: pcs, bottle, tablet", 400);
    }

    // Validate min_stock
    if (min_stock !== undefined && min_stock < 0) {
      throw new AppError("Min stock cannot be negative", 400);
    }

    const product = await ProductModel.create({
      name,
      unit,
      category_id,
      min_stock: min_stock || 0,
      location,
    });

    const response: ApiResponse<Product> = {
      success: true,
      message: "Product created successfully",
      data: product,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all products with pagination and filters
 */
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const unit = req.query.unit as string | undefined;
    const categoryId = req.query.category
      ? parseInt(req.query.category as string)
      : undefined;
    const searchTerm = req.query.q as string | undefined;

    // Validate unit if provided
    if (unit && !["pcs", "bottle", "tablet"].includes(unit)) {
      throw new AppError("Unit must be one of: pcs, bottle, tablet", 400);
    }

    const result = await ProductModel.findAll(
      page,
      limit,
      unit,
      categoryId,
      searchTerm
    );

    const response: PaginatedResponse<Product> = {
      data: result.products,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Products data retrieved successfully",
      data: response,
    });
  }
);

/**
 * Get product by ID
 */
export const getProductById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const response: ApiResponse<Product> = {
      success: true,
      message: "Product data retrieved successfully",
      data: product,
    };

    res.json(response);
  }
);

/**
 * Update product by ID
 */
export const updateProductById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(req.params.id);
    const { name, unit, category_id, min_stock, location } =
      req.body as UpdateProductRequest;

    if (isNaN(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    const existingProduct = await ProductModel.findById(productId);
    if (!existingProduct) {
      throw new AppError("Product not found", 404);
    }

    // Validate unit if provided
    if (unit && !["pcs", "bottle", "tablet"].includes(unit)) {
      throw new AppError("Unit must be one of: pcs, bottle, tablet", 400);
    }

    // Validate min_stock if provided
    if (min_stock !== undefined && min_stock < 0) {
      throw new AppError("Min stock cannot be negative", 400);
    }

    const updateData: UpdateProductRequest = {};
    if (name !== undefined) updateData.name = name;
    if (unit !== undefined) updateData.unit = unit;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (min_stock !== undefined) updateData.min_stock = min_stock;
    if (location !== undefined) updateData.location = location;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No data provided to update", 400);
    }

    const updatedProduct = await ProductModel.update(productId, updateData);
    if (!updatedProduct) {
      throw new AppError("Failed to update product", 500);
    }

    const response: ApiResponse<Product> = {
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    };

    res.json(response);
  }
);

/**
 * Delete product by ID
 */
export const deleteProductById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const success = await ProductModel.delete(productId);
    if (!success) {
      throw new AppError("Failed to delete product", 500);
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  }
);
