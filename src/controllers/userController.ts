import { Request, Response } from "express";
import { UserModel } from "@/models/User";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import { ApiResponse, PaginatedResponse, User } from "@/types";

/**
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await UserModel.findAll(page, limit);

    const response: PaginatedResponse<Omit<User, "password">> = {
      data: result.users,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: response,
    });
  }
);

/**
 * Get user by ID (admin only)
 */
export const getUserById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const response: ApiResponse = {
      success: true,
      message: "User retrieved successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };

    res.json(response);
  }
);

/**
 * Update user by ID (admin only)
 */
export const updateUserById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);
    const { username, email, role, is_active } = req.body;

    if (isNaN(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updateData: any = {};

    if (username !== undefined) updateData.username = username;
    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Invalid email format", 400);
      }
      updateData.email = email;
    }
    if (role !== undefined) {
      if (!["admin", "manager", "user"].includes(role)) {
        throw new AppError("Invalid role", 400);
      }
      updateData.role = role;
    }
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError("Email already taken by another user", 409);
      }
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        throw new AppError("Username already taken by another user", 409);
      }
    }

    const updatedUser = await UserModel.update(userId, updateData);
    if (!updatedUser) {
      throw new AppError("Failed to update user", 500);
    }

    const response: ApiResponse = {
      success: true,
      message: "User updated successfully",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        is_active: updatedUser.is_active,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      },
    };

    res.json(response);
  }
);

/**
 * Delete user by ID (admin only)
 */
export const deleteUserById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const success = await UserModel.delete(userId);
    if (!success) {
      throw new AppError("Failed to delete user", 500);
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  }
);

