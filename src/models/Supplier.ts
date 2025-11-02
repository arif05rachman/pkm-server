import { pool } from "@/config/database";
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from "@/types";

export class SupplierModel {
  /**
   * Create a new supplier
   */
  static async create(supplierData: CreateSupplierRequest): Promise<Supplier> {
    const { nama_supplier, alamat, kontak } = supplierData;

    const query = `
      INSERT INTO supplier (nama_supplier, alamat, kontak, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;

    const values = [nama_supplier, alamat || null, kontak || null];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Find supplier by ID
   */
  static async findById(id_supplier: number): Promise<Supplier | null> {
    const query = "SELECT * FROM supplier WHERE id_supplier = $1";
    const result = await pool.query(query, [id_supplier]);

    return result.rows[0] || null;
  }

  /**
   * Get all supplier with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    supplier: Supplier[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = "SELECT COUNT(*) FROM supplier";
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    // Get supplier
    const query = `
      SELECT * FROM supplier
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);

    return {
      supplier: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search supplier by name, alamat, or kontak
   */
  static async search(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    supplier: Supplier[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) FROM supplier
      WHERE nama_supplier ILIKE $1 OR alamat ILIKE $1 OR kontak ILIKE $1
    `;
    const countResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].count);

    // Get supplier
    const query = `
      SELECT * FROM supplier
      WHERE nama_supplier ILIKE $1 OR alamat ILIKE $1 OR kontak ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [searchPattern, limit, offset]);

    return {
      supplier: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update supplier
   */
  static async update(
    id_supplier: number,
    updateData: UpdateSupplierRequest
  ): Promise<Supplier | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && key !== "id_supplier" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value === "" ? null : value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id_supplier);

    const query = `
      UPDATE supplier 
      SET ${fields.join(", ")}
      WHERE id_supplier = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete supplier
   */
  static async delete(id_supplier: number): Promise<boolean> {
    const query = "DELETE FROM supplier WHERE id_supplier = $1";
    const result = await pool.query(query, [id_supplier]);

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Check if nama_supplier exists
   */
  static async namaSupplierExists(
    nama_supplier: string,
    excludeId?: number
  ): Promise<boolean> {
    let query = "SELECT id_supplier FROM supplier WHERE nama_supplier = $1";
    const params: any[] = [nama_supplier];

    if (excludeId) {
      query += " AND id_supplier != $2";
      params.push(excludeId);
    }

    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
}

