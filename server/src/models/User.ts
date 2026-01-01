import { pool } from "@/config/database";
import { User, CreateUserRequest, QueryResult } from "@/types";
import { hashPassword, comparePassword } from "@/utils/bcrypt";

export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: CreateUserRequest): Promise<User> {
    const { username, email, password, role = "user", employee_id } = userData;

    const hashedPassword = await hashPassword(password);

    const query = `
      INSERT INTO users (username, email, password, role, is_active, employee_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      username,
      email,
      hashedPassword,
      role,
      true,
      employee_id || null,
    ];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<User | null> {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);

    return result.rows[0] || null;
  }

  /**
   * Get all users with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string
  ): Promise<{
    users: Omit<User, "password">[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    let query =
      "SELECT id, username, email, role, is_active, employee_id, created_at, updated_at FROM users WHERE 1=1";
    const values: any[] = [];
    let paramIndex = 1;

    if (searchTerm) {
      query += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      values.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(
      "SELECT id, username, email, role, is_active, employee_id, created_at, updated_at FROM users",
      "SELECT COUNT(*)"
    );
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get users
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      users: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update user
   */
  static async update(
    id: number,
    updateData: Partial<User>
  ): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && key !== "id" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete user (soft delete)
   */
  static async delete(id: number): Promise<boolean> {
    const query =
      "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1";
    const result = await pool.query(query, [id]);

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Verify user password
   */
  static async verifyPassword(
    username: string,
    password: string
  ): Promise<User | null> {
    const user = await this.findByUsername(username);

    if (!user) {
      return null;
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return null;
    }

    return user;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const query = "SELECT id FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    return result.rows.length > 0;
  }

  /**
   * Check if username exists
   */
  static async usernameExists(username: string): Promise<boolean> {
    const query = "SELECT id FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);

    return result.rows.length > 0;
  }

  /**
   * Find user by employee_id
   */
  static async findByEmployeeId(employee_id: number): Promise<User | null> {
    const query = "SELECT * FROM users WHERE employee_id = $1";
    const result = await pool.query(query, [employee_id]);

    return result.rows[0] || null;
  }
}
