import { pool } from "@/config/database";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const seedData = async () => {
  try {
    console.log("🌱 Seeding database...");

    // Helper to get random item from array
    const getRandom = (arr: any[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    // 1. Create Users
    console.log("Creating users...");
    const passwordHash = await bcrypt.hash("password123", 10);

    // Check if admin exists
    const adminCheck = await pool.query(
      "SELECT id FROM users WHERE username = 'admin'"
    );
    if (adminCheck.rows.length === 0) {
      await pool.query(
        `
        INSERT INTO users (username, email, password, role, is_active)
        VALUES ('admin', 'admin@example.com', $1, 'admin', true)
        `,
        [passwordHash]
      );
    }

    // 2. Create Barang with Stock
    console.log("Creating/Updating barang...");
    const barangData = [
      {
        nama: "Paracetamol 500mg",
        satuan: "tablet",
        jenis: "Obat",
        stok: 1000,
        min: 100,
        lokasi: "Rak Obat A",
      },
      {
        nama: "Amoxicillin 500mg",
        satuan: "tablet",
        jenis: "Obat",
        stok: 500,
        min: 50,
        lokasi: "Rak Obat B",
      },
      {
        nama: "Perban Gulung",
        satuan: "pcs",
        jenis: "BMHP",
        stok: 200,
        min: 20,
        lokasi: "Lemari 1",
      },
      {
        nama: "Betadine 30ml",
        satuan: "botol",
        jenis: "Obat",
        stok: 50,
        min: 10,
        lokasi: "Rak Luar",
      },
      {
        nama: "Spuit 3cc",
        satuan: "pcs",
        jenis: "Alkes",
        stok: 300,
        min: 50,
        lokasi: "Lemari 2",
      },
    ];

    for (const b of barangData) {
      await pool.query(
        `
        INSERT INTO barang (nama_barang, satuan, jenis, stok, stok_minimal, lokasi)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id_barang) DO NOTHING
      `,
        [b.nama, b.satuan, b.jenis, b.stok, b.min, b.lokasi]
      );

      // Attempt to update stock for existing items just in case ensuring we have data to play with
      await pool.query(
        `
          UPDATE barang SET stok = $1 WHERE nama_barang = $2 AND stok = 0
      `,
        [b.stok, b.nama]
      );
    }

    console.log("✅ Seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
