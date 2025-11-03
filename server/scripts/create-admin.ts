#!/usr/bin/env ts-node

import { pool } from "../src/config/database";

/**
 * Create default admin user
 */
const createAdminUser = async (): Promise<void> => {
  try {
    console.log("🔄 Creating admin user...");

    const adminPasswordHash =
      "$2a$12$Re6IXyyQ2Do3Lhj/OwqcU.NP4FkW4EHBxZDsci3CXHTMajq2KOjYW";

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role, is_active) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) 
       DO UPDATE SET 
         email = EXCLUDED.email,
         password = EXCLUDED.password,
         role = EXCLUDED.role,
         is_active = EXCLUDED.is_active,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, username, email, role`,
      ["admin", "admin@inventory.com", adminPasswordHash, "admin", true]
    );

    if (result.rows.length > 0) {
      console.log("✅ Admin user created/updated successfully!");
      console.log("📊 Admin user details:");
      console.log("   ID:", result.rows[0].id);
      console.log("   Username: admin");
      console.log("   Email: admin@inventory.com");
      console.log("   Password: admin123");
      console.log("   Role: admin");
    } else {
      console.log("⚠️  Admin user might already exist");
    }
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run script
createAdminUser()
  .then(() => {
    console.log("✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
