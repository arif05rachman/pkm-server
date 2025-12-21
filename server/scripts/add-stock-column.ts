import { pool } from "../src/config/database";

const addStockColumn = async () => {
  try {
    console.log("🔄 Adding stock column to barang table...");

    // Add stok column if it doesn't exist
    await pool.query(`
      ALTER TABLE barang 
      ADD COLUMN IF NOT EXISTS stok INTEGER NOT NULL DEFAULT 0;
    `);

    // Create index for stok if it doesn't exist
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_barang_stok ON barang(stok);
    `);

    console.log("✅ Stock column added successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add stock column:", error);
    process.exit(1);
  }
};

addStockColumn();
