import { pool } from "@/config/database";
import {
  TransaksiKeluar,
  DetailTransaksiKeluar,
  CreateTransaksiKeluarRequest,
  UpdateTransaksiKeluarRequest,
  CreateDetailTransaksiKeluarRequest,
  UpdateDetailTransaksiKeluarRequest,
  TransaksiKeluarWithDetails,
} from "@/types";

export class TransaksiKeluarModel {
  /**
   * Create a new transaksi keluar with details
   */
  static async create(
    transaksiData: CreateTransaksiKeluarRequest,
    userId: number
  ): Promise<TransaksiKeluarWithDetails> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert transaksi keluar
      const transaksiQuery = `
        INSERT INTO transaksi_keluar (tanggal_keluar, tujuan, id_user, keterangan, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;

      const transaksiValues = [
        transaksiData.tanggal_keluar,
        transaksiData.tujuan,
        userId, // Use the authenticated user's ID
        transaksiData.keterangan || null,
      ];

      const transaksiResult = await client.query(
        transaksiQuery,
        transaksiValues
      );
      const transaksi = transaksiResult.rows[0];

      // Insert details
      const details: DetailTransaksiKeluar[] = [];
      for (const detail of transaksiData.details) {
        const detailQuery = `
          INSERT INTO detail_transaksi_keluar 
          (id_transaksi_keluar, id_barang, jumlah, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING *
        `;

        const detailValues = [
          transaksi.id_transaksi_keluar,
          detail.id_barang,
          detail.jumlah,
        ];

        const detailResult = await client.query(detailQuery, detailValues);
        details.push(detailResult.rows[0]);
      }

      await client.query("COMMIT");

      return {
        ...transaksi,
        details,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find transaksi keluar by ID
   */
  static async findById(
    id_transaksi_keluar: number
  ): Promise<TransaksiKeluarWithDetails | null> {
    // Get transaksi
    const transaksiQuery =
      "SELECT * FROM transaksi_keluar WHERE id_transaksi_keluar = $1";
    const transaksiResult = await pool.query(transaksiQuery, [
      id_transaksi_keluar,
    ]);

    if (transaksiResult.rows.length === 0) {
      return null;
    }

    const transaksi = transaksiResult.rows[0];

    // Get details
    const detailsQuery = `
      SELECT * FROM detail_transaksi_keluar 
      WHERE id_transaksi_keluar = $1
      ORDER BY id_detail_keluar
    `;
    const detailsResult = await pool.query(detailsQuery, [id_transaksi_keluar]);

    return {
      ...transaksi,
      details: detailsResult.rows,
    };
  }

  /**
   * Get all transaksi keluar with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string,
    tujuan?: string
  ): Promise<{
    transaksi: TransaksiKeluar[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Build count query with filters
    let countQuery = "SELECT COUNT(*) FROM transaksi_keluar WHERE 1=1";
    const countParams: any[] = [];
    let paramCount = 1;

    if (startDate) {
      countQuery += ` AND tanggal_keluar >= $${paramCount}`;
      countParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      countQuery += ` AND tanggal_keluar <= $${paramCount}`;
      countParams.push(endDate);
      paramCount++;
    }

    if (tujuan) {
      countQuery += ` AND tujuan ILIKE $${paramCount}`;
      countParams.push(`%${tujuan}%`);
      paramCount++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Build select query with filters
    let query = "SELECT * FROM transaksi_keluar WHERE 1=1";
    const queryParams: any[] = [];
    paramCount = 1;

    if (startDate) {
      query += ` AND tanggal_keluar >= $${paramCount}`;
      queryParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND tanggal_keluar <= $${paramCount}`;
      queryParams.push(endDate);
      paramCount++;
    }

    if (tujuan) {
      query += ` AND tujuan ILIKE $${paramCount}`;
      queryParams.push(`%${tujuan}%`);
      paramCount++;
    }

    query += ` ORDER BY tanggal_keluar DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    return {
      transaksi: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update transaksi keluar
   */
  static async update(
    id_transaksi_keluar: number,
    updateData: UpdateTransaksiKeluarRequest
  ): Promise<TransaksiKeluar | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        key !== "id_transaksi_keluar" &&
        key !== "created_at"
      ) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value === "" ? null : value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id_transaksi_keluar);

    const query = `
      UPDATE transaksi_keluar 
      SET ${fields.join(", ")}
      WHERE id_transaksi_keluar = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete transaksi keluar (will cascade delete details)
   */
  static async delete(id_transaksi_keluar: number): Promise<boolean> {
    const query = "DELETE FROM transaksi_keluar WHERE id_transaksi_keluar = $1";
    const result = await pool.query(query, [id_transaksi_keluar]);

    return (result.rowCount ?? 0) > 0;
  }
}

export class DetailTransaksiKeluarModel {
  /**
   * Create a new detail transaksi keluar
   */
  static async create(
    id_transaksi_keluar: number,
    detailData: CreateDetailTransaksiKeluarRequest
  ): Promise<DetailTransaksiKeluar> {
    const query = `
      INSERT INTO detail_transaksi_keluar 
      (id_transaksi_keluar, id_barang, jumlah, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id_transaksi_keluar,
      detailData.id_barang,
      detailData.jumlah,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find detail by ID
   */
  static async findById(
    id_detail_keluar: number
  ): Promise<DetailTransaksiKeluar | null> {
    const query = "SELECT * FROM detail_transaksi_keluar WHERE id_detail_keluar = $1";
    const result = await pool.query(query, [id_detail_keluar]);

    return result.rows[0] || null;
  }

  /**
   * Get all details by transaksi_keluar ID
   */
  static async findByTransaksiKeluarId(
    id_transaksi_keluar: number
  ): Promise<DetailTransaksiKeluar[]> {
    const query = `
      SELECT * FROM detail_transaksi_keluar 
      WHERE id_transaksi_keluar = $1
      ORDER BY id_detail_keluar
    `;
    const result = await pool.query(query, [id_transaksi_keluar]);

    return result.rows;
  }

  /**
   * Update detail transaksi keluar
   */
  static async update(
    id_detail_keluar: number,
    updateData: UpdateDetailTransaksiKeluarRequest
  ): Promise<DetailTransaksiKeluar | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        key !== "id_detail_keluar" &&
        key !== "created_at"
      ) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value === "" ? null : value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id_detail_keluar);

    const query = `
      UPDATE detail_transaksi_keluar 
      SET ${fields.join(", ")}
      WHERE id_detail_keluar = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete detail transaksi keluar
   */
  static async delete(id_detail_keluar: number): Promise<boolean> {
    const query =
      "DELETE FROM detail_transaksi_keluar WHERE id_detail_keluar = $1";
    const result = await pool.query(query, [id_detail_keluar]);

    return (result.rowCount ?? 0) > 0;
  }
}

