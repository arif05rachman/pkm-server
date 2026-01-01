import { pool } from "@/config/database";
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "@/types";

export class EmployeeModel {
  /**
   * Find all employees with pagination
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
    searchTerm?: string
  ): Promise<{ employees: Employee[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM employees WHERE 1=1";
    const values: any[] = [];
    let paramIndex = 1;

    if (isActive !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      values.push(isActive);
      paramIndex++;
    }

    if (searchTerm) {
      query += ` AND (name ILIKE $${paramIndex} OR position ILIKE $${paramIndex} OR nip ILIKE $${paramIndex})`;
      values.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*)");
    const totalResult = await pool.query(countQuery, values);
    const total = parseInt(totalResult.rows[0].count);

    // Get data
    query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      employees: result.rows,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find employee by ID
   */
  static async findById(id: number): Promise<Employee | null> {
    const query = "SELECT * FROM employees WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Find employee by NIP
   */
  static async findByNip(nip: string): Promise<Employee | null> {
    const query = "SELECT * FROM employees WHERE nip = $1";
    const result = await pool.query(query, [nip]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Create new employee
   */
  static async create(data: CreateEmployeeRequest): Promise<Employee> {
    const { name, position, nip, phone, address, is_active } = data;
    const query = `
      INSERT INTO employees (name, position, nip, phone, address, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      name,
      position,
      nip || null,
      phone || null,
      address || null,
      is_active !== undefined ? is_active : true,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update employee
   */
  static async update(
    id: number,
    data: UpdateEmployeeRequest
  ): Promise<Employee | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) return null;

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const values = [id, ...Object.values(data)];

    const query = `
      UPDATE employees 
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
   * Delete employee
   */
  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM employees WHERE id = $1";
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
