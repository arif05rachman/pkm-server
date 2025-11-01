import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types";

/**
 * Check if user is admin
 */
export const requireAdmin = (
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

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return;
  }

  next();
};

/**
 * Check if user is admin or manager
 */
export const requireAdminOrManager = (
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

  if (!["admin", "manager"].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      message: "Admin or Manager access required",
    });
    return;
  }

  next();
};
