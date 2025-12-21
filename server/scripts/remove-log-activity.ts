import { pool } from "../src/config/database";

const removeLogActivityTable = async () => {
  try {
    console.log("🔥 Removing log_activity table...");

    await pool.query("DROP TABLE IF EXISTS log_activity CASCADE");

    console.log("✅ Log Activity table removed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to remove log_activity table:", error);
    process.exit(1);
  }
};

removeLogActivityTable();
