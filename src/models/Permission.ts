import { pool } from "@/config/database";

export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: Date;
  updated_at: Date;
}

export interface RolePermission {
  id: number;
  role: string;
  permission_id: number;
  created_at: Date;
}

export class PermissionModel {
  /**
   * Get all permissions
   */
  static async findAll(): Promise<Permission[]> {
    const query = "SELECT * FROM permissions ORDER BY resource, action";
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get permissions by role
   */
  static async findByRole(role: string): Promise<Permission[]> {
    const query = `
      SELECT p.*
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role = $1
      ORDER BY p.resource, p.action
    `;

    const result = await pool.query(query, [role]);
    return result.rows;
  }

  /**
   * Check if role has specific permission
   */
  static async roleHasPermission(
    role: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role = $1 AND p.resource = $2 AND p.action = $3
    `;

    const result = await pool.query(query, [role, resource, action]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Get user permissions (based on role)
   */
  static async getUserPermissions(userRole: string): Promise<Permission[]> {
    return this.findByRole(userRole);
  }

  /**
   * Create a new permission
   */
  static async create(
    permission: Omit<Permission, "id" | "created_at" | "updated_at">
  ): Promise<Permission> {
    const { name, description, resource, action } = permission;

    const query = `
      INSERT INTO permissions (name, description, resource, action, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;

    const values = [name, description, resource, action];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Assign permission to role
   */
  static async assignPermissionToRole(
    role: string,
    permissionId: number
  ): Promise<boolean> {
    const query = `
      INSERT INTO role_permissions (role, permission_id, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (role, permission_id) DO NOTHING
    `;

    const result = await pool.query(query, [role, permissionId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Remove permission from role
   */
  static async removePermissionFromRole(
    role: string,
    permissionId: number
  ): Promise<boolean> {
    const query = `
      DELETE FROM role_permissions 
      WHERE role = $1 AND permission_id = $2
    `;

    const result = await pool.query(query, [role, permissionId]);
    return (result.rowCount ?? 0) > 0;
  }
}
