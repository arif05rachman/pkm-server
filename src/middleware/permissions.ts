import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types";
import { PermissionModel } from "@/models/Permission";

/**
 * Check if user has specific permission
 */
export const requirePermission = (resource: string, action: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const hasPermission = await PermissionModel.roleHasPermission(
        req.user.role,
        resource,
        action
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${resource}:${action}`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 */
export const requireAnyPermission = (
  permissions: Array<{ resource: string; action: string }>
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      let hasAnyPermission = false;
      for (const permission of permissions) {
        const hasPermission = await PermissionModel.roleHasPermission(
          req.user.role,
          permission.resource,
          permission.action
        );
        if (hasPermission) {
          hasAnyPermission = true;
          break;
        }
      }

      if (!hasAnyPermission) {
        res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

/**
 * Check if user has all of the specified permissions
 */
export const requireAllPermissions = (
  permissions: Array<{ resource: string; action: string }>
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      let hasAllPermissions = true;
      for (const permission of permissions) {
        const hasPermission = await PermissionModel.roleHasPermission(
          req.user.role,
          permission.resource,
          permission.action
        );
        if (!hasPermission) {
          hasAllPermissions = false;
          break;
        }
      }

      if (!hasAllPermissions) {
        res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

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
