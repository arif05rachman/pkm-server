#!/usr/bin/env ts-node

import { pool } from "../src/config/database";
import { hash } from "bcryptjs";

const generateRandomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const firstNames = [
  "Adit",
  "Bayu",
  "Cahya",
  "Dian",
  "Eka",
  "Fani",
  "Gilang",
  "Hana",
  "Indra",
  "Jaya",
  "Kiki",
  "Lia",
  "Maya",
  "Nanda",
  "Oki",
  "Putra",
  "Rani",
  "Sari",
  "Tio",
  "Vina",
];
const lastNames = [
  "Pratama",
  "Saputra",
  "Wibowo",
  "Lestari",
  "Kusuma",
  "Hidayat",
  "Santoso",
  "Wijaya",
  "Nugroho",
  "Rahayu",
  "Utami",
  "Susanti",
  "Siregar",
  "Nasution",
  "Sihombing",
];
const jobs = [
  "Dokter Umum",
  "Dokter Gigi",
  "Perawat",
  "Bidan",
  "Apoteker",
  "Staff Admin",
  "Petugas Kebersihan",
  "Security",
];
const locations = [
  "Gudang A - Rak 1",
  "Gudang A - Rak 2",
  "Gudang B - Kulkas",
  "Gudang C - Lemari 1",
  "Poli Umum",
  "Poli Gigi",
  "IGD",
];
const medicineNames = [
  "Amoxicillin",
  "Paracetamol",
  "Ibuprofen",
  "Asam Mefenamat",
  "Cetirizine",
  "Loratadine",
  "Omeprazole",
  "Ranitidine",
  "Antasida",
  "Vitamin C",
  "Vitamin B Complex",
  "Zinc",
  "Metformin",
  "Amlodipine",
  "Captopril",
];
const alkesNames = [
  "Spuit 3cc",
  "Spuit 5cc",
  "Infus Set",
  "Abocath 24G",
  "Abocath 22G",
  "Masker Medis",
  "Handscoon S",
  "Handscoon M",
  "Handscoon L",
  "Perban",
  "Plester",
  "Kapas",
  "Alkohol Swab",
  "Thermometer",
  "Stethoscope",
];
const types: ("Obat" | "Alkes" | "BMHP")[] = ["Obat", "Alkes", "BMHP"];
const units: ("pcs" | "botol" | "tablet")[] = ["pcs", "botol", "tablet"];

const seedData = async () => {
  try {
    console.log("🌱 Starting seed data...");

    // 1. Seed Karyawan
    console.log("Creating 15 Karyawan...");
    const karyawanIds: number[] = [];

    for (let i = 0; i < 15; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName} ${generateRandomString(2)}`; // Ensure uniqueness
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const nip = `NIP${Date.now()}${i}`; // Unique NIP
      const phone = `08${Math.floor(Math.random() * 1000000000)}`;
      const address = `Jl. ${generateRandomString(5)} No. ${Math.floor(
        Math.random() * 100
      )}`;

      const result = await pool.query(
        "INSERT INTO karyawan (nama_karyawan, jabatan, nip, no_hp, alamat, status_aktif) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_karyawan",
        [name, job, nip, phone, address, true]
      );
      karyawanIds.push(result.rows[0].id_karyawan);
    }
    console.log("✅ Karyawan seeded.");

    // 2. Seed Users
    console.log("Creating 15 Users...");
    const hashedPassword = await hash("password123", 10);

    for (let i = 0; i < 15; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const username = `${firstName.toLowerCase()}${generateRandomString(4)}`;
      const email = `${username}@example.com`;
      const role = i % 10 === 0 ? "admin" : i % 5 === 0 ? "manager" : "user";

      // Link to a random NEW karyawan (or explicit one if we wanted 1-to-1, but let's just pick random)
      // Note: id_karyawan is unique? No, 1 user -> 1 karyawan usually. But 1 karyawan can be used by multiple users? Prefer 1-1.
      // Let's use the created karyawanIds[i] if available, otherwise null.
      const id_karyawan = i < karyawanIds.length ? karyawanIds[i] : null;

      await pool.query(
        "INSERT INTO users (username, email, password, role, is_active, id_karyawan) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
        [username, email, hashedPassword, role, true, id_karyawan]
      );
    }
    console.log("✅ Users seeded.");

    // 3. Seed Barang
    console.log("Creating 15 Barang...");
    for (let i = 0; i < 15; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let itemName = "";
      let unit = units[0];

      if (type === "Obat") {
        itemName =
          medicineNames[i % medicineNames.length] +
          " " +
          generateRandomString(3);
        unit = "tablet"; // simplified
      } else {
        itemName =
          alkesNames[i % alkesNames.length] + " " + generateRandomString(3);
        unit = "pcs";
      }

      const stockMin = Math.floor(Math.random() * 50) + 10;
      const location = locations[Math.floor(Math.random() * locations.length)];
      const safeUnit = unit as "pcs" | "botol" | "tablet";

      await pool.query(
        "INSERT INTO barang (nama_barang, satuan, jenis, stok_minimal, lokasi) VALUES ($1, $2, $3, $4, $5)",
        [itemName, safeUnit, type, stockMin, location]
      );
    }
    console.log("✅ Barang seeded.");

    // 4. Seed Suppliers
    console.log("Creating 15 Suppliers...");
    const suppliers = [
      "CV. Pasundan Mitra Utama",
      "CV. Klik Media",
      "CV. Putra Intan Sehati",
      "Citilink",
      "Swiss-bel hotel",
      "CV. SUFI COORPORATE INDONESIA",
      "CV. Indonesia Multiguna Mandiri",
      "CV. Jimat Inovasi Nusantara",
      "PT. Telekomunikasi Indonesia",
      "CV. Maju Bersama",
      "PT. Sehat Selalu",
      "CV. Berkah Abadi",
      "PT. Sinar Harapan",
      "CV. Bintang Terang",
      "PT. Karya Utama",
    ];

    for (const supplierName of suppliers) {
      const address = `Jl. ${generateRandomString(5)} No. ${Math.floor(
        Math.random() * 100
      )}`;
      const contact = `021-${Math.floor(Math.random() * 100000000)}`;

      await pool.query(
        "INSERT INTO supplier (nama_supplier, alamat, kontak) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [supplierName, address, contact]
      );
    }
    console.log("✅ Suppliers seeded.");

    console.log("✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    pool.end();
  }
};

seedData();
