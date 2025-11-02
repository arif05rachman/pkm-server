import { pool } from "@/config/database";
import {
  TransaksiMasuk,
  DetailTransaksiMasuk,
  CreateTransaksiMasukRequest,
  UpdateTransaksiMasukRequest,
  CreateDetailTransaksiMasukRequest,
  UpdateDetailTransaksiMasukRequest,
  TransaksiMasukWithDetails,
} from "@/types";

export class TransaksiMasukModel {
  /**
   * Create a new transaksi masuk with details
   */
  static async create(
    transaksiData: CreateTransaksiMasukRequest,
    userId: number
  ): Promise<TransaksiMasukWithDetails> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert transaksi masuk
      const transaksiQuery = `
        INSERT INTO transaksi_masuk (tanggal_masuk, id_supplier, id_user, keterangan, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;

      const transaksiValues = [
        transaksiData.tanggal_masuk,
        transaksiData.id_supplier || null,
        userId, // Use the authenticated user's ID
        transaksiData.keterangan || null,
      ];

      const transaksiResult = await client.query(
        transaksiQuery,
        transaksiValues
      );
      const transaksi = transaksiResult.rows[0];

      // Insert details
      const details: DetailTransaksiMasuk[] = [];
      for (const detail of transaksiData.details) {
        const detailQuery = `
          INSERT INTO detail_transaksi_masuk 
          (id_transaksi_masuk, id_barang, jumlah, harga_satuan, tanggal_kadaluarsa, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *
        `;

        const detailValues = [
          transaksi.id_transaksi_masuk,
          detail.id_barang,
          detail.jumlah,
          detail.harga_satuan,
          detail.tanggal_kadaluarsa || null,
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
   * Find transaksi masuk by ID
   */
  static async findById(
    id_transaksi_masuk: number
  ): Promise<TransaksiMasukWithDetails | null> {
    // Get transaksi
    const transaksiQuery =
      "SELECT * FROM transaksi_masuk WHERE id_transaksi_masuk = $1";
    const transaksiResult = await pool.query(transaksiQuery, [
      id_transaksi_masuk,
    ]);

    if (transaksiResult.rows.length === 0) {
      return null;
    }

    const transaksi = transaksiResult.rows[0];

    // Get details
    const detailsQuery = `
      SELECT * FROM detail_transaksi_masuk 
      WHERE id_transaksi_masuk = $1
      ORDER BY id_detail_masuk
    `;
    const detailsResult = await pool.query(detailsQuery, [id_transaksi_masuk]);

    return {
      ...transaksi,
      details: detailsResult.rows,
    };
  }

  /**
   * Get all transaksi masuk with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string,
    id_supplier?: number
  ): Promise<{
    transaksi: TransaksiMasuk[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Build count query with filters
    let countQuery = "SELECT COUNT(*) FROM transaksi_masuk WHERE 1=1";
    const countParams: any[] = [];
    let paramCount = 1;

    if (startDate) {
      countQuery += ` AND tanggal_masuk >= $${paramCount}`;
      countParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      countQuery += ` AND tanggal_masuk <= $${paramCount}`;
      countParams.push(endDate);
      paramCount++;
    }

    if (id_supplier) {
      countQuery += ` AND id_supplier = $${paramCount}`;
      countParams.push(id_supplier);
      paramCount++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Build select query with filters
    let query = "SELECT * FROM transaksi_masuk WHERE 1=1";
    const queryParams: any[] = [];
    paramCount = 1;

    if (startDate) {
      query += ` AND tanggal_masuk >= $${paramCount}`;
      queryParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND tanggal_masuk <= $${paramCount}`;
      queryParams.push(endDate);
      paramCount++;
    }

    if (id_supplier) {
      query += ` AND id_supplier = $${paramCount}`;
      queryParams.push(id_supplier);
      paramCount++;
    }

    query += ` ORDER BY tanggal_masuk DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    return {
      transaksi: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update transaksi masuk
   */
  static async update(
    id_transaksi_masuk: number,
    updateData: UpdateTransaksiMasukRequest
  ): Promise<TransaksiMasuk | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        key !== "id_transaksi_masuk" &&
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
    values.push(id_transaksi_masuk);

    const query = `
      UPDATE transaksi_masuk 
      SET ${fields.join(", ")}
      WHERE id_transaksi_masuk = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete transaksi masuk (will cascade delete details)
   */
  static async delete(id_transaksi_masuk: number): Promise<boolean> {
    const query = "DELETE FROM transaksi_masuk WHERE id_transaksi_masuk = $1";
    const result = await pool.query(query, [id_transaksi_masuk]);

    return (result.rowCount ?? 0) > 0;
  }
}

export class DetailTransaksiMasukModel {
  /**
   * Create a new detail transaksi masuk
   */
  static async create(
    id_transaksi_masuk: number,
    detailData: CreateDetailTransaksiMasukRequest
  ): Promise<DetailTransaksiMasuk> {
    const query = `
      INSERT INTO detail_transaksi_masuk 
      (id_transaksi_masuk, id_barang, jumlah, harga_satuan, tanggal_kadaluarsa, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id_transaksi_masuk,
      detailData.id_barang,
      detailData.jumlah,
      detailData.harga_satuan,
      detailData.tanggal_kadaluarsa || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find detail by ID
   */
  static async findById(
    id_detail_masuk: number
  ): Promise<DetailTransaksiMasuk | null> {
    const query = "SELECT * FROM detail_transaksi_masuk WHERE id_detail_masuk = $1";
    const result = await pool.query(query, [id_detail_masuk]);

    return result.rows[0] || null;
  }

  /**
   * Get all details by transaksi_masuk ID
   */
  static async findByTransaksiMasukId(
    id_transaksi_masuk: number
  ): Promise<DetailTransaksiMasuk[]> {
    const query = `
      SELECT * FROM detail_transaksi_masuk 
      WHERE id_transaksi_masuk = $1
      ORDER BY id_detail_masuk
    `;
    const result = await pool.query(query, [id_transaksi_masuk]);

    return result.rows;
  }

  /**
   * Update detail transaksi masuk
   */
  static async update(
    id_detail_masuk: number,
    updateData: UpdateDetailTransaksiMasukRequest
  ): Promise<DetailTransaksiMasuk | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        key !== "id_detail_masuk" &&
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
    values.push(id_detail_masuk);

    const query = `
      UPDATE detail_transaksi_masuk 
      SET ${fields.join(", ")}
      WHERE id_detail_masuk = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete detail transaksi masuk
   */
  static async delete(id_detail_masuk: number): Promise<boolean> {
    const query =
      "DELETE FROM detail_transaksi_masuk WHERE id_detail_masuk = $1";
    const result = await pool.query(query, [id_detail_masuk]);

    return (result.rowCount ?? 0) > 0;
  }
}

