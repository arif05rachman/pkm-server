import { pool } from "@/config/database";
import {
  StockIn,
  StockInDetail,
  StockInWithDetails,
  CreateStockInRequest,
} from "@/types";

export class StockInModel {
  /**
   * Find all stock ins with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ stockIns: any[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) FROM stock_ins";
    const totalResult = await pool.query(countQuery);
    const total = parseInt(totalResult.rows[0].count);

    const query = `
      SELECT si.*, s.name as supplier_name, u.username as user_name
      FROM stock_ins si
      LEFT JOIN suppliers s ON si.supplier_id = s.id
      LEFT JOIN users u ON si.user_id = u.id
      ORDER BY si.date DESC, si.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);

    return {
      stockIns: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find stock in by ID with details
   */
  static async findById(id: number): Promise<StockInWithDetails | null> {
    // Get stock in header
    const stockInQuery = `
      SELECT si.*, s.name as supplier_name, u.username as user_name
      FROM stock_ins si
      LEFT JOIN suppliers s ON si.supplier_id = s.id
      LEFT JOIN users u ON si.user_id = u.id
      WHERE si.id = $1
    `;
    const stockInResult = await pool.query(stockInQuery, [id]);

    if (stockInResult.rows.length === 0) {
      return null;
    }

    const stockIn = stockInResult.rows[0];

    // Get details
    const detailsQuery = `
      SELECT sid.*, p.name as product_name
      FROM stock_in_details sid
      JOIN products p ON sid.product_id = p.id
      WHERE sid.stock_in_id = $1
      ORDER BY sid.id ASC
    `;
    const detailsResult = await pool.query(detailsQuery, [id]);

    return {
      ...stockIn,
      details: detailsResult.rows,
    };
  }

  /**
   * Create new stock in with details (Transaction)
   */
  static async create(data: CreateStockInRequest): Promise<StockInWithDetails> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { date, supplier_id, user_id, description, details } = data;

      // 1. Insert stock in header
      const stockInQuery = `
        INSERT INTO stock_ins (date, supplier_id, user_id, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const stockInValues = [date, supplier_id, user_id, description];
      const stockInResult = await client.query(stockInQuery, stockInValues);
      const stockIn = stockInResult.rows[0];

      const insertedDetails: StockInDetail[] = [];

      // 2. Insert details and update product stock
      for (const detail of details) {
        const { product_id, quantity, unit_price, expiry_date } = detail;

        // Insert detail
        const detailQuery = `
          INSERT INTO stock_in_details (stock_in_id, product_id, quantity, unit_price, expiry_date)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        const detailValues = [
          stockIn.id,
          product_id,
          quantity,
          unit_price,
          expiry_date || null,
        ];
        const detailResult = await client.query(detailQuery, detailValues);
        insertedDetails.push(detailResult.rows[0]);

        // Update product stock
        const updateStockQuery = `
          UPDATE products 
          SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $2
        `;
        await client.query(updateStockQuery, [quantity, product_id]);
      }

      await client.query("COMMIT");

      return {
        ...stockIn,
        details: insertedDetails,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete stock in (Transaction)
   * This should ideally reverse the stock update
   */
  static async delete(id: number): Promise<boolean> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Get details to reverse stock
      const detailsQuery =
        "SELECT product_id, quantity FROM stock_in_details WHERE stock_in_id = $1";
      const detailsResult = await client.query(detailsQuery, [id]);

      // 2. Reverse stock
      for (const detail of detailsResult.rows) {
        const updateStockQuery = `
          UPDATE products 
          SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $2
        `;
        await client.query(updateStockQuery, [
          detail.quantity,
          detail.product_id,
        ]);
      }

      // 3. Delete stock in (will cascade to details)
      const deleteQuery = "DELETE FROM stock_ins WHERE id = $1";
      const result = await client.query(deleteQuery, [id]);

      await client.query("COMMIT");
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
