import { Request, Response } from "express";
import { CategoryModel } from "@/models/Category";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  ApiResponse,
  PaginatedResponse,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types";

/**
 * Create a new category
 */
export const createCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, description } = req.body as CreateCategoryRequest;

    if (!name) {
      throw new AppError("Category name is required", 400);
    }

    const existingCategory = await CategoryModel.nameExists(name);
    if (existingCategory) {
      throw new AppError("Category name already exists", 409);
    }

    const category = await CategoryModel.create({ name, description });

    const response: ApiResponse<Category> = {
      success: true,
      message: "Category created successfully",
      data: category,
    };

    res.status(201).json(response);
  }
);

/**
 * Get all categories with pagination
 */
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await CategoryModel.findAll(page, limit);

    const response: PaginatedResponse<Category> = {
      data: result.categories,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Categories data retrieved successfully",
      data: response,
    });
  }
);

/**
 * Search categories by name or description
 */
export const searchCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const searchTerm = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!searchTerm) {
      throw new AppError("Search term (q) is required", 400);
    }

    const result = await CategoryModel.search(searchTerm, page, limit);

    const response: PaginatedResponse<Category> = {
      data: result.categories,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Categories search results retrieved",
      data: response,
    });
  }
);

/**
 * Get category by ID
 */
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      throw new AppError("Invalid category ID", 400);
    }

    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const response: ApiResponse<Category> = {
      success: true,
      message: "Category data retrieved successfully",
      data: category,
    };

    res.json(response);
  }
);

/**
 * Update category by ID
 */
export const updateCategoryById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = parseInt(req.params.id);
    const { name, description } = req.body as UpdateCategoryRequest;

    if (isNaN(categoryId)) {
      throw new AppError("Invalid category ID", 400);
    }

    const existingCategory = await CategoryModel.findById(categoryId);
    if (!existingCategory) {
      throw new AppError("Category not found", 404);
    }

    if (name && name !== existingCategory.name) {
      const nameExists = await CategoryModel.nameExists(name, categoryId);
      if (nameExists) {
        throw new AppError(
          "Category name already used by another category",
          409
        );
      }
    }

    const updatedCategory = await CategoryModel.update(categoryId, {
      name,
      description,
    });
    if (!updatedCategory) {
      throw new AppError("Failed to update category", 500);
    }

    const response: ApiResponse<Category> = {
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    };

    res.json(response);
  }
);

/**
 * Delete category by ID
 */
export const deleteCategoryById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      throw new AppError("Invalid category ID", 400);
    }

    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const success = await CategoryModel.delete(categoryId);
    if (!success) {
      throw new AppError("Failed to delete category", 500);
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  }
);
