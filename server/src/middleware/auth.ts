import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt";
import { AuthenticatedRequest } from "@/types";
import { pool } from "@/config/database";

/**
 * Authentication middleware to verify JWT token
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists and is active
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT id, username, email, role, is_active FROM users WHERE id = $1 AND is_active = true",
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        res.status(401).json({
          success: false,
          message: "User not found or inactive",
        });
        return;
      }

      req.user = result.rows[0];
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Invalid token",
    });
  }
};

/**
 * Authorization middleware to check user roles
 */
export const authorizeRoles = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = verifyToken(token);
      const client = await pool.connect();
      try {
        const result = await client.query(
          "SELECT id, username, email, role, is_active FROM users WHERE id = $1 AND is_active = true",
          [decoded.userId]
        );

        if (result.rows.length > 0) {
          req.user = result.rows[0];
        }
      } finally {
        client.release();
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
