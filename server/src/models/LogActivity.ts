import { pool } from "@/config/database";
import { LogActivity, CreateLogActivityRequest } from "@/types";

export class LogActivityModel {
  /**
   * Create a new log activity
   */
  static async create(logData: CreateLogActivityRequest): Promise<LogActivity> {
    const { id_user, aksi, deskripsi, ip_address, waktu } = logData;

    const query = `
      INSERT INTO log_activity (id_user, waktu, aksi, deskripsi, ip_address, created_at)
      VALUES ($1, COALESCE($2::timestamp, CURRENT_TIMESTAMP), $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      id_user || null,
      waktu || null,
      aksi,
      deskripsi || null,
      ip_address || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find log by ID
   */
  static async findById(id_log: number): Promise<LogActivity | null> {
    const query = "SELECT * FROM log_activity WHERE id_log = $1";
    const result = await pool.query(query, [id_log]);

    return result.rows[0] || null;
  }

  /**
   * Get all logs with pagination and filters
   */
  static async findAll(
    page: number = 1,
    limit: number = 50,
    id_user?: number,
    aksi?: string,
    startDate?: string,
    endDate?: string,
    ip_address?: string
  ): Promise<{
    logs: LogActivity[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Build count query with filters
    let countQuery = "SELECT COUNT(*) FROM log_activity WHERE 1=1";
    const countParams: any[] = [];
    let paramCount = 1;

    if (id_user) {
      countQuery += ` AND id_user = $${paramCount}`;
      countParams.push(id_user);
      paramCount++;
    }

    if (aksi) {
      countQuery += ` AND aksi = $${paramCount}`;
      countParams.push(aksi);
      paramCount++;
    }

    if (startDate) {
      countQuery += ` AND waktu >= $${paramCount}`;
      countParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      countQuery += ` AND waktu <= $${paramCount}`;
      countParams.push(endDate);
      paramCount++;
    }

    if (ip_address) {
      countQuery += ` AND ip_address = $${paramCount}`;
      countParams.push(ip_address);
      paramCount++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Build select query with filters
    let query = "SELECT * FROM log_activity WHERE 1=1";
    const queryParams: any[] = [];
    paramCount = 1;

    if (id_user) {
      query += ` AND id_user = $${paramCount}`;
      queryParams.push(id_user);
      paramCount++;
    }

    if (aksi) {
      query += ` AND aksi = $${paramCount}`;
      queryParams.push(aksi);
      paramCount++;
    }

    if (startDate) {
      query += ` AND waktu >= $${paramCount}`;
      queryParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND waktu <= $${paramCount}`;
      queryParams.push(endDate);
      paramCount++;
    }

    if (ip_address) {
      query += ` AND ip_address = $${paramCount}`;
      queryParams.push(ip_address);
      paramCount++;
    }

    query += ` ORDER BY waktu DESC, id_log DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    return {
      logs: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search logs by description
   */
  static async search(
    searchTerm: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    logs: LogActivity[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) FROM log_activity
      WHERE deskripsi ILIKE $1 OR aksi ILIKE $1
    `;
    const countResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].count);

    // Get logs
    const query = `
      SELECT * FROM log_activity
      WHERE deskripsi ILIKE $1 OR aksi ILIKE $1
      ORDER BY waktu DESC, id_log DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [searchPattern, limit, offset]);

    return {
      logs: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get logs by user ID
   */
  static async findByUserId(
    id_user: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    logs: LogActivity[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = "SELECT COUNT(*) FROM log_activity WHERE id_user = $1";
    const countResult = await pool.query(countQuery, [id_user]);
    const total = parseInt(countResult.rows[0].count);

    // Get logs
    const query = `
      SELECT * FROM log_activity
      WHERE id_user = $1
      ORDER BY waktu DESC, id_log DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [id_user, limit, offset]);

    return {
      logs: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete old logs (older than specified days)
   */
  static async deleteOldLogs(daysOld: number): Promise<number> {
    const query = `
      DELETE FROM log_activity 
      WHERE waktu < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
    `;
    const result = await pool.query(query);

    return result.rowCount || 0;
  }

  /**
   * Get log statistics by action type
   */
  static async getStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<{ aksi: string; count: number }[]> {
    let query = `
      SELECT aksi, COUNT(*) as count
      FROM log_activity
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND waktu >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND waktu <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ` GROUP BY aksi ORDER BY count DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }
}

