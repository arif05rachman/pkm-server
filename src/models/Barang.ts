import { pool } from "@/config/database";
import { Barang, CreateBarangRequest, UpdateBarangRequest } from "@/types";

export class BarangModel {
  /**
   * Create a new barang
   */
  static async create(barangData: CreateBarangRequest): Promise<Barang> {
    const { nama_barang, satuan, jenis, stok_minimal = 0, lokasi } = barangData;

    const query = `
      INSERT INTO barang (nama_barang, satuan, jenis, stok_minimal, lokasi, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const values = [nama_barang, satuan, jenis, stok_minimal, lokasi || null];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Find barang by ID
   */
  static async findById(id_barang: number): Promise<Barang | null> {
    const query = "SELECT * FROM barang WHERE id_barang = $1";
    const result = await pool.query(query, [id_barang]);

    return result.rows[0] || null;
  }

  /**
   * Get all barang with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    jenis?: string,
    satuan?: string
  ): Promise<{
    barang: Barang[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Build count query with filters
    let countQuery = "SELECT COUNT(*) FROM barang WHERE 1=1";
    const countParams: any[] = [];
    let paramCount = 1;

    if (jenis) {
      countQuery += ` AND jenis = $${paramCount}`;
      countParams.push(jenis);
      paramCount++;
    }

    if (satuan) {
      countQuery += ` AND satuan = $${paramCount}`;
      countParams.push(satuan);
      paramCount++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Build select query with filters
    let query = "SELECT * FROM barang WHERE 1=1";
    const queryParams: any[] = [];
    paramCount = 1;

    if (jenis) {
      query += ` AND jenis = $${paramCount}`;
      queryParams.push(jenis);
      paramCount++;
    }

    if (satuan) {
      query += ` AND satuan = $${paramCount}`;
      queryParams.push(satuan);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    return {
      barang: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search barang by name
   */
  static async search(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    barang: Barang[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) FROM barang
      WHERE nama_barang ILIKE $1 OR lokasi ILIKE $1
    `;
    const countResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].count);

    // Get barang
    const query = `
      SELECT * FROM barang
      WHERE nama_barang ILIKE $1 OR lokasi ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [searchPattern, limit, offset]);

    return {
      barang: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update barang
   */
  static async update(
    id_barang: number,
    updateData: UpdateBarangRequest
  ): Promise<Barang | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && key !== "id_barang" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value === "" ? null : value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id_barang);

    const query = `
      UPDATE barang 
      SET ${fields.join(", ")}
      WHERE id_barang = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete barang
   */
  static async delete(id_barang: number): Promise<boolean> {
    const query = "DELETE FROM barang WHERE id_barang = $1";
    const result = await pool.query(query, [id_barang]);

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Check if nama_barang exists
   */
  static async namaBarangExists(
    nama_barang: string,
    excludeId?: number
  ): Promise<boolean> {
    let query = "SELECT id_barang FROM barang WHERE nama_barang = $1";
    const params: any[] = [nama_barang];

    if (excludeId) {
      query += " AND id_barang != $2";
      params.push(excludeId);
    }

    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
}

