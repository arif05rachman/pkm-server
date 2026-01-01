import { pool } from "@/config/database";
import { Product, CreateProductRequest, UpdateProductRequest } from "@/types";

export class ProductModel {
  /**
   * Find all products with pagination and filters
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    type?: string,
    unit?: string,
    categoryId?: number
  ): Promise<{ products: any[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND p.type = $${paramIndex}`;
      values.push(type);
      paramIndex++;
    }

    if (unit) {
      query += ` AND p.unit = $${paramIndex}`;
      values.push(unit);
      paramIndex++;
    }

    if (categoryId) {
      query += ` AND p.category_id = $${paramIndex}`;
      values.push(categoryId);
      paramIndex++;
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM products p 
      WHERE 1=1
      ${type ? ` AND type = $1` : ""}
      ${unit ? ` AND unit = $${type ? 2 : 1}` : ""}
      ${
        categoryId
          ? ` AND category_id = $${(type ? 1 : 0) + (unit ? 1 : 0) + 1}`
          : ""
      }
    `;
    const totalResult = await pool.query(countQuery, values);
    const total = parseInt(totalResult.rows[0].count);

    // Get paginated data
    query += ` ORDER BY p.name ASC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      products: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find product by ID
   */
  static async findById(id: number): Promise<any | null> {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Search products by name or location
   */
  static async search(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: any[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    const countQuery =
      "SELECT COUNT(*) FROM products WHERE name ILIKE $1 OR location ILIKE $1";
    const totalResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(totalResult.rows[0].count);

    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.name ILIKE $1 OR p.location ILIKE $1 
      ORDER BY p.name ASC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [searchPattern, limit, offset]);

    return {
      products: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create new product
   */
  static async create(data: CreateProductRequest): Promise<Product> {
    const { name, unit, type, category_id, min_stock, location } = data;
    const query = `
      INSERT INTO products (name, unit, type, category_id, min_stock, stock, location)
      VALUES ($1, $2, $3, $4, $5, 0, $6)
      RETURNING *
    `;
    const values = [
      name,
      unit,
      type,
      category_id || null,
      min_stock || 0,
      location,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update product
   */
  static async update(
    id: number,
    data: UpdateProductRequest
  ): Promise<Product | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) return null;

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const values = [id, ...Object.values(data)];

    const query = `
      UPDATE products 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Update product stock
   */
  static async updateStock(
    id: number,
    quantity: number,
    isAddition: boolean = true
  ): Promise<boolean> {
    const query = isAddition
      ? "UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2"
      : "UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND stock >= $1";

    const result = await pool.query(query, [quantity, id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete product
   */
  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM products WHERE id = $1";
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get products with low stock
   */
  static async getLowStock(): Promise<Product[]> {
    const query =
      "SELECT * FROM products WHERE stock <= min_stock ORDER BY name ASC";
    const result = await pool.query(query);
    return result.rows;
  }
}
