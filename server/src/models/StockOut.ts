import { pool } from "@/config/database";
import {
  StockOut,
  StockOutDetail,
  StockOutWithDetails,
  CreateStockOutRequest,
} from "@/types";

export class StockOutModel {
  /**
   * Find all stock outs with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ stockOuts: any[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) FROM stock_outs";
    const totalResult = await pool.query(countQuery);
    const total = parseInt(totalResult.rows[0].count);

    const query = `
      SELECT so.*, u.username as user_name
      FROM stock_outs so
      LEFT JOIN users u ON so.user_id = u.id
      ORDER BY so.date DESC, so.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);

    return {
      stockOuts: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find stock out by ID with details
   */
  static async findById(id: number): Promise<StockOutWithDetails | null> {
    const stockOutQuery = `
      SELECT so.*, u.username as user_name
      FROM stock_outs so
      LEFT JOIN users u ON so.user_id = u.id
      WHERE so.id = $1
    `;
    const stockOutResult = await pool.query(stockOutQuery, [id]);

    if (stockOutResult.rows.length === 0) {
      return null;
    }

    const stockOut = stockOutResult.rows[0];

    const detailsQuery = `
      SELECT sod.*, p.name as product_name
      FROM stock_out_details sod
      JOIN products p ON sod.product_id = p.id
      WHERE sod.stock_out_id = $1
      ORDER BY sod.id ASC
    `;
    const detailsResult = await pool.query(detailsQuery, [id]);

    return {
      ...stockOut,
      details: detailsResult.rows,
    };
  }

  /**
   * Create new stock out with details (Transaction)
   */
  static async create(
    data: CreateStockOutRequest
  ): Promise<StockOutWithDetails> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { date, destination, user_id, description, details } = data;

      // 1. Insert stock out header
      const stockOutQuery = `
        INSERT INTO stock_outs (date, destination, user_id, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const stockOutValues = [date, destination, user_id, description];
      const stockOutResult = await client.query(stockOutQuery, stockOutValues);
      const stockOut = stockOutResult.rows[0];

      const insertedDetails: StockOutDetail[] = [];

      // 2. Insert details and update product stock
      for (const detail of details) {
        const { product_id, quantity } = detail;

        // Check stock availability
        const stockQuery = "SELECT stock, name FROM products WHERE id = $1";
        const stockResult = await client.query(stockQuery, [product_id]);

        if (stockResult.rows.length === 0) {
          throw new Error(`Product with ID ${product_id} not found`);
        }

        const product = stockResult.rows[0];
        if (product.stock < quantity) {
          throw new Error(
            `Insufficient stock for product: ${product.name}. Available: ${product.stock}, requested: ${quantity}`
          );
        }

        // Insert detail
        const detailQuery = `
          INSERT INTO stock_out_details (stock_out_id, product_id, quantity)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        const detailValues = [stockOut.id, product_id, quantity];
        const detailResult = await client.query(detailQuery, detailValues);
        insertedDetails.push(detailResult.rows[0]);

        // Update product stock
        const updateStockQuery = `
          UPDATE products 
          SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $2
        `;
        await client.query(updateStockQuery, [quantity, product_id]);
      }

      await client.query("COMMIT");

      return {
        ...stockOut,
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
   * Delete stock out (Transaction)
   */
  static async delete(id: number): Promise<boolean> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Get details to reverse stock
      const detailsQuery =
        "SELECT product_id, quantity FROM stock_out_details WHERE stock_out_id = $1";
      const detailsResult = await client.query(detailsQuery, [id]);

      // 2. Reverse stock
      for (const detail of detailsResult.rows) {
        const updateStockQuery = `
          UPDATE products 
          SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $2
        `;
        await client.query(updateStockQuery, [
          detail.quantity,
          detail.product_id,
        ]);
      }

      // 3. Delete stock out (will cascade to details)
      const deleteQuery = "DELETE FROM stock_outs WHERE id = $1";
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
