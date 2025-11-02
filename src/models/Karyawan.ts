import { pool } from "@/config/database";
import { Karyawan, CreateKaryawanRequest, UpdateKaryawanRequest } from "@/types";

export class KaryawanModel {
  /**
   * Create a new karyawan
   */
  static async create(karyawanData: CreateKaryawanRequest): Promise<Karyawan> {
    const {
      nama_karyawan,
      jabatan,
      nip,
      no_hp,
      alamat,
      status_aktif = true,
    } = karyawanData;

    const query = `
      INSERT INTO karyawan (nama_karyawan, jabatan, nip, no_hp, alamat, status_aktif, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;

    const values = [nama_karyawan, jabatan, nip || null, no_hp || null, alamat || null, status_aktif];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Find karyawan by ID
   */
  static async findById(id_karyawan: number): Promise<Karyawan | null> {
    const query = "SELECT * FROM karyawan WHERE id_karyawan = $1";
    const result = await pool.query(query, [id_karyawan]);

    return result.rows[0] || null;
  }

  /**
   * Find karyawan by NIP
   */
  static async findByNip(nip: string): Promise<Karyawan | null> {
    const query = "SELECT * FROM karyawan WHERE nip = $1";
    const result = await pool.query(query, [nip]);

    return result.rows[0] || null;
  }

  /**
   * Get all karyawan with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    status_aktif?: boolean
  ): Promise<{
    karyawan: Karyawan[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Build count query
    let countQuery = "SELECT COUNT(*) FROM karyawan";
    const countParams: any[] = [];

    if (status_aktif !== undefined) {
      countQuery += " WHERE status_aktif = $1";
      countParams.push(status_aktif);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Build select query
    let query = "SELECT * FROM karyawan";
    const queryParams: any[] = [];

    if (status_aktif !== undefined) {
      query += " WHERE status_aktif = $1";
      queryParams.push(status_aktif);
      query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3";
      queryParams.push(limit, offset);
    } else {
      query += " ORDER BY created_at DESC LIMIT $1 OFFSET $2";
      queryParams.push(limit, offset);
    }

    const result = await pool.query(query, queryParams);

    return {
      karyawan: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search karyawan by name or NIP
   */
  static async search(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    karyawan: Karyawan[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) FROM karyawan
      WHERE nama_karyawan ILIKE $1 OR nip ILIKE $1
    `;
    const countResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].count);

    // Get karyawan
    const query = `
      SELECT * FROM karyawan
      WHERE nama_karyawan ILIKE $1 OR nip ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [searchPattern, limit, offset]);

    return {
      karyawan: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update karyawan
   */
  static async update(
    id_karyawan: number,
    updateData: UpdateKaryawanRequest
  ): Promise<Karyawan | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && key !== "id_karyawan" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value === "" ? null : value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id_karyawan);

    const query = `
      UPDATE karyawan 
      SET ${fields.join(", ")}
      WHERE id_karyawan = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete karyawan (soft delete by setting status_aktif to false)
   */
  static async delete(id_karyawan: number): Promise<boolean> {
    const query =
      "UPDATE karyawan SET status_aktif = false, updated_at = NOW() WHERE id_karyawan = $1";
    const result = await pool.query(query, [id_karyawan]);

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Hard delete karyawan (permanent deletion)
   */
  static async hardDelete(id_karyawan: number): Promise<boolean> {
    const query = "DELETE FROM karyawan WHERE id_karyawan = $1";
    const result = await pool.query(query, [id_karyawan]);

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Check if NIP exists
   */
  static async nipExists(nip: string, excludeId?: number): Promise<boolean> {
    let query = "SELECT id_karyawan FROM karyawan WHERE nip = $1";
    const params: any[] = [nip];

    if (excludeId) {
      query += " AND id_karyawan != $2";
      params.push(excludeId);
    }

    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
}

