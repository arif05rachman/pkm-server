import { Request, Response } from "express";
import { UserModel } from "@/models/User";
import { RefreshTokenModel } from "@/models/RefreshToken";
import { generateTokens, generateAccessTokenFromRefresh } from "@/utils/jwt";
import { validatePasswordStrength } from "@/utils/bcrypt";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import {
  CreateUserRequest,
  LoginRequest,
  AuthResponse,
  ApiResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "@/types";
import { config } from "@/config/env";

/**
 * Register a new user
 */
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, email, password, role }: CreateUserRequest = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      throw new AppError("Username, email, and password are required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", 400);
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new AppError(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`,
        400
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      throw new AppError("Username already taken", 409);
    }

    // Create user
    const user = await UserModel.create({
      username,
      email,
      password,
      role: role || "user",
      id_karyawan: req.body.id_karyawan,
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshTokenModel.create({
      user_id: user.id,
      token: tokens.refreshToken,
      expires_at: expiresAt,
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        id_karyawan: user.id_karyawan,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: response,
    });
  }
);

/**
 * Login user
 */
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password }: LoginRequest = req.body;
    // Validate required fields
    if (!username || !password) {
      throw new AppError("username and password are required", 400);
    }

    // Verify user credentials
    const user = await UserModel.verifyPassword(username, password);
    if (!user) {
      throw new AppError("Invalid username or password", 401);
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AppError("Account is deactivated", 401);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshTokenModel.create({
      user_id: user.id,
      token: tokens.refreshToken,
      expires_at: expiresAt,
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        id_karyawan: user.id_karyawan,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    res.json({
      success: true,
      message: "Login successful",
      data: response,
    });
  }
);

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const response: ApiResponse = {
      success: true,
      message: "Profile retrieved successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        id_karyawan: user.id_karyawan,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };

    res.json(response);
  }
);

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const { username, email } = req.body;

    const updateData: any = {};

    if (username) updateData.username = username;
    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Invalid email format", 400);
      }
      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError("Email already taken by another user", 409);
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError("Username already taken by another user", 409);
      }
    }

    const updatedUser = await UserModel.update(userId, updateData);
    if (!updatedUser) {
      throw new AppError("Failed to update profile", 500);
    }

    const response: ApiResponse = {
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        is_active: updatedUser.is_active,
        id_karyawan: updatedUser.id_karyawan,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      },
    };

    res.json(response);
  }
);

/**
 * Change password
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError("Current password and new password are required", 400);
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new AppError(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`,
        400
      );
    }

    // Get user and verify current password
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { comparePassword } = await import("@/utils/bcrypt");
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    // Hash new password and update
    const { hashPassword } = await import("@/utils/bcrypt");
    const hashedNewPassword = await hashPassword(newPassword);

    const updatedUser = await UserModel.update(userId, {
      password: hashedNewPassword,
    });
    if (!updatedUser) {
      throw new AppError("Failed to update password", 500);
    }

    const response: ApiResponse = {
      success: true,
      message: "Password changed successfully",
    };

    res.json(response);
  }
);

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken }: RefreshTokenRequest = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    // Find refresh token in database
    const tokenRecord = await RefreshTokenModel.findByToken(refreshToken);
    if (!tokenRecord) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Get user information
    const user = await UserModel.findById(tokenRecord.user_id);
    if (!user || !user.is_active) {
      throw new AppError("User not found or inactive", 401);
    }

    // Generate new access token
    const newAccessToken = generateAccessTokenFromRefresh({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response: RefreshTokenResponse = {
      token: newAccessToken,
      refreshToken: refreshToken, // Keep the same refresh token
    };

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: response,
    });
  }
);

/**
 * Logout user (revoke refresh token)
 */
export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken }: RefreshTokenRequest = req.body;

    if (refreshToken) {
      await RefreshTokenModel.revokeToken(refreshToken);
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

/**
 * Logout from all devices (revoke all refresh tokens)
 */
export const logoutAll = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;

    await RefreshTokenModel.revokeAllUserTokens(userId);

    res.json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  }
);
