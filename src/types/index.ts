import { Request } from "express";

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user" | "manager";
  is_active: boolean;
  id_karyawan: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user" | "manager";
  id_karyawan?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, "password">;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// JWT Payload
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extended Request interface
export interface AuthenticatedRequest extends Request {
  user?: Omit<User, "password">;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Database Query Result
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Karyawan types
export interface Karyawan {
  id_karyawan: number;
  nama_karyawan: string;
  jabatan: string;
  nip: string | null;
  no_hp: string | null;
  alamat: string | null;
  status_aktif: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateKaryawanRequest {
  nama_karyawan: string;
  jabatan: string;
  nip?: string;
  no_hp?: string;
  alamat?: string;
  status_aktif?: boolean;
}

export interface UpdateKaryawanRequest {
  nama_karyawan?: string;
  jabatan?: string;
  nip?: string;
  no_hp?: string;
  alamat?: string;
  status_aktif?: boolean;
}

// Barang types
export interface Barang {
  id_barang: number;
  nama_barang: string;
  satuan: "pcs" | "botol" | "tablet";
  jenis: "Obat" | "Alkes" | "BMHP";
  stok_minimal: number;
  lokasi: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBarangRequest {
  nama_barang: string;
  satuan: "pcs" | "botol" | "tablet";
  jenis: "Obat" | "Alkes" | "BMHP";
  stok_minimal?: number;
  lokasi?: string;
}

export interface UpdateBarangRequest {
  nama_barang?: string;
  satuan?: "pcs" | "botol" | "tablet";
  jenis?: "Obat" | "Alkes" | "BMHP";
  stok_minimal?: number;
  lokasi?: string;
}

// Supplier types
export interface Supplier {
  id_supplier: number;
  nama_supplier: string;
  alamat: string | null;
  kontak: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSupplierRequest {
  nama_supplier: string;
  alamat?: string;
  kontak?: string;
}

export interface UpdateSupplierRequest {
  nama_supplier?: string;
  alamat?: string;
  kontak?: string;
}

// Transaksi Masuk types
export interface TransaksiMasuk {
  id_transaksi_masuk: number;
  tanggal_masuk: Date;
  id_supplier: number | null;
  id_user: number | null;
  keterangan: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DetailTransaksiMasuk {
  id_detail_masuk: number;
  id_transaksi_masuk: number;
  id_barang: number;
  jumlah: number;
  harga_satuan: number;
  tanggal_kadaluarsa: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface TransaksiMasukWithDetails extends TransaksiMasuk {
  details: DetailTransaksiMasuk[];
}

export interface CreateTransaksiMasukRequest {
  tanggal_masuk: string;
  id_supplier?: number;
  id_user?: number;
  keterangan?: string;
  details: CreateDetailTransaksiMasukRequest[];
}

export interface CreateDetailTransaksiMasukRequest {
  id_barang: number;
  jumlah: number;
  harga_satuan: number;
  tanggal_kadaluarsa?: string;
}

export interface UpdateTransaksiMasukRequest {
  tanggal_masuk?: string;
  id_supplier?: number;
  id_user?: number;
  keterangan?: string;
}

export interface UpdateDetailTransaksiMasukRequest {
  id_barang?: number;
  jumlah?: number;
  harga_satuan?: number;
  tanggal_kadaluarsa?: string;
}

// Transaksi Keluar types
export interface TransaksiKeluar {
  id_transaksi_keluar: number;
  tanggal_keluar: Date;
  tujuan: string;
  id_user: number | null;
  keterangan: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DetailTransaksiKeluar {
  id_detail_keluar: number;
  id_transaksi_keluar: number;
  id_barang: number;
  jumlah: number;
  created_at: Date;
  updated_at: Date;
}

export interface TransaksiKeluarWithDetails extends TransaksiKeluar {
  details: DetailTransaksiKeluar[];
}

export interface CreateTransaksiKeluarRequest {
  tanggal_keluar: string;
  tujuan: string;
  id_user?: number;
  keterangan?: string;
  details: CreateDetailTransaksiKeluarRequest[];
}

export interface CreateDetailTransaksiKeluarRequest {
  id_barang: number;
  jumlah: number;
}

export interface UpdateTransaksiKeluarRequest {
  tanggal_keluar?: string;
  tujuan?: string;
  id_user?: number;
  keterangan?: string;
}

export interface UpdateDetailTransaksiKeluarRequest {
  id_barang?: number;
  jumlah?: number;
}

// Log Activity types
export interface LogActivity {
  id_log: number;
  id_user: number | null;
  waktu: Date;
  aksi: string;
  deskripsi: string | null;
  ip_address: string | null;
  created_at: Date;
}

export interface CreateLogActivityRequest {
  id_user?: number;
  aksi: string;
  deskripsi?: string;
  ip_address?: string;
  waktu?: string; // Optional, defaults to current timestamp
}
