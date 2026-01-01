import { pool } from "@/config/database";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types";

export class CategoryModel {
  /**
   * Create a new category
   */
  static async create(categoryData: CreateCategoryRequest): Promise<Category> {
    const { name, description } = categoryData;

    const query = `
      INSERT INTO categories (name, description, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `;

    const values = [name, description || null];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Find category by ID
   */
  static async findById(id: number): Promise<Category | null> {
    const query = "SELECT * FROM categories WHERE id = $1";
    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
  }

  /**
   * Get all categories with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    categories: Category[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = "SELECT COUNT(*) FROM categories";
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    // Get categories
    const query = `
      SELECT * FROM categories
      ORDER BY name ASC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);

    return {
      categories: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search categories by name or description
   */
  static async search(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    categories: Category[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) FROM categories
      WHERE name ILIKE $1 OR description ILIKE $1
    `;
    const countResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].count);

    // Get categories
    const query = `
      SELECT * FROM categories
      WHERE name ILIKE $1 OR description ILIKE $1
      ORDER BY name ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [searchPattern, limit, offset]);

    return {
      categories: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update category
   */
  static async update(
    id: number,
    updateData: UpdateCategoryRequest
  ): Promise<Category | null> {
    const fields: string[] = [];
    const values: any[] = [];
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
      UPDATE categories 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete category
   */
  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM categories WHERE id = $1";
    const result = await pool.query(query, [id]);

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Check if category name exists
   */
  static async nameExists(name: string, excludeId?: number): Promise<boolean> {
    let query = "SELECT id FROM categories WHERE name = $1";
    const params: any[] = [name];

    if (excludeId) {
      query += " AND id != $2";
      params.push(excludeId);
    }

    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
}
