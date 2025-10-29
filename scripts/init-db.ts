#!/usr/bin/env ts-node

import { initializeDatabase, checkDatabaseTables } from "../src/database/init";
import { testConnection } from "../src/config/database";

/**
 * Initialize database script
 */
const initDatabase = async (): Promise<void> => {
  try {
    console.log("🔄 Starting database initialization...");

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error(
        "❌ Cannot connect to database. Please check your database configuration."
      );
      process.exit(1);
    }

    // Check if tables already exist
    const tablesExist = await checkDatabaseTables();
    if (tablesExist) {
      console.log("✅ Database tables already exist");
      console.log("💡 To reset the database, run: pnpm run reset-db");
      return;
    }

    // Initialize database
    await initializeDatabase();
    console.log("✅ Database initialization completed successfully!");
    console.log("📊 Default admin user created:");
    console.log("   Email: admin@inventory.com");
    console.log("   Password: admin123");
    console.log("   Role: admin");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
};

// Run initialization
initDatabase();
