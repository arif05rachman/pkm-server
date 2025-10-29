import { pool } from "@/config/database";

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  is_revoked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRefreshTokenRequest {
  user_id: number;
  token: string;
  expires_at: Date;
}

export class RefreshTokenModel {
  /**
   * Create a new refresh token
   */
  static async create(
    tokenData: CreateRefreshTokenRequest
  ): Promise<RefreshToken> {
    const { user_id, token, expires_at } = tokenData;

    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at, is_revoked, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;

    const values = [user_id, token, expires_at, false];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Find refresh token by token string
   */
  static async findByToken(token: string): Promise<RefreshToken | null> {
    const query = `
      SELECT rt.*, u.is_active as user_is_active
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token = $1 AND rt.is_revoked = false AND rt.expires_at > NOW()
    `;

    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  }

  /**
   * Find all refresh tokens for a user
   */
  static async findByUserId(userId: number): Promise<RefreshToken[]> {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE user_id = $1 AND is_revoked = false AND expires_at > NOW()
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Revoke a specific refresh token
   */
  static async revokeToken(token: string): Promise<boolean> {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = true, updated_at = NOW()
      WHERE token = $1
    `;

    const result = await pool.query(query, [token]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllUserTokens(userId: number): Promise<boolean> {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = true, updated_at = NOW()
      WHERE user_id = $1 AND is_revoked = false
    `;

    const result = await pool.query(query, [userId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const query = `
      DELETE FROM refresh_tokens 
      WHERE expires_at < NOW() OR is_revoked = true
    `;

    const result = await pool.query(query);
    return result.rowCount ?? 0;
  }

  /**
   * Check if user has too many active tokens
   */
  static async countActiveTokens(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM refresh_tokens 
      WHERE user_id = $1 AND is_revoked = false AND expires_at > NOW()
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}
