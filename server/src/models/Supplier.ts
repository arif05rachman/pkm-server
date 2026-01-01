import { pool } from "@/config/database";
import {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "@/types";

export class SupplierModel {
  /**
   * Create a new supplier
   */
  static async create(supplierData: CreateSupplierRequest): Promise<Supplier> {
    const { name, address, contact } = supplierData;

    const query = `
      INSERT INTO suppliers (name, address, contact, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;

    const values = [name, address || null, contact || null];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Find supplier by ID
   */
  static async findById(id: number): Promise<Supplier | null> {
    const query = "SELECT * FROM suppliers WHERE id = $1";
    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
  }

  /**
   * Get all suppliers with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string
  ): Promise<{
    suppliers: Supplier[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM suppliers WHERE 1=1";
    const values: any[] = [];
    let paramIndex = 1;

    if (searchTerm) {
      query += ` AND (name ILIKE $${paramIndex} OR address ILIKE $${paramIndex} OR contact ILIKE $${paramIndex})`;
      values.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*)");
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get suppliers
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      suppliers: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search suppliers by name, address, or contact
   */
  static async search(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    suppliers: Supplier[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) FROM suppliers
      WHERE name ILIKE $1 OR address ILIKE $1 OR contact ILIKE $1
    `;
    const countResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].count);

    // Get suppliers
    const query = `
      SELECT * FROM suppliers
      WHERE name ILIKE $1 OR address ILIKE $1 OR contact ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [searchPattern, limit, offset]);

    return {
      suppliers: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update supplier
   */
  static async update(
    id: number,
    updateData: UpdateSupplierRequest
  ): Promise<Supplier | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && key !== "id" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value === "" ? null : value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE suppliers 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete supplier
   */
  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM suppliers WHERE id = $1";
    const result = await pool.query(query, [id]);

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Check if supplier name exists
   */
  static async nameExists(name: string, excludeId?: number): Promise<boolean> {
    let query = "SELECT id FROM suppliers WHERE name = $1";
    const params: any[] = [name];

    if (excludeId) {
      query += " AND id != $2";
      params.push(excludeId);
    }

    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
}
