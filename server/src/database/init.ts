import { pool } from "@/config/database";
import fs from "fs";
import path from "path";

/**
 * Initialize database with tables and default data
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log("🔄 Initializing database...");

    // Read SQL initialization file
    const sqlPath = path.join(__dirname, "init.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    // Execute SQL commands
    await pool.query(sqlContent);

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

/**
 * Check if database tables exist
 */
export const checkDatabaseTables = async (): Promise<boolean> => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'products', 'categories')
    `);

    return result.rows.length >= 3;
  } catch (error) {
    console.error("❌ Error checking database tables:", error);
    return false;
  }
};

/**
 * Reset database (WARNING: This will delete all data)
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log("⚠️  Resetting database...");

    // Drop tables in reverse order (to handle foreign key constraints)
    await pool.query("DROP TABLE IF EXISTS activity_logs CASCADE");
    await pool.query("DROP TABLE IF EXISTS stock_out_details CASCADE");
    await pool.query("DROP TABLE IF EXISTS stock_outs CASCADE");
    await pool.query("DROP TABLE IF EXISTS stock_in_details CASCADE");
    await pool.query("DROP TABLE IF EXISTS stock_ins CASCADE");
    await pool.query("DROP TABLE IF EXISTS suppliers CASCADE");
    await pool.query("DROP TABLE IF EXISTS products CASCADE");
    await pool.query("DROP TABLE IF EXISTS categories CASCADE");
    await pool.query("DROP TABLE IF EXISTS employees CASCADE");
    await pool.query("DROP TABLE IF EXISTS refresh_tokens CASCADE");
    await pool.query("DROP TABLE IF EXISTS users CASCADE");
    await pool.query(
      "DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE"
    );

    // Reinitialize database
    await initializeDatabase();

    console.log("✅ Database reset completed");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    throw error;
  }
};
