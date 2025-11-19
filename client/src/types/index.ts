// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "manager" | "user";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Barang types
export interface Barang {
  id_barang: number;
  nama_barang: string;
  satuan: "pcs" | "botol" | "tablet";
  jenis: "Obat" | "Alkes" | "BMHP";
  stok_minimal: number;
  lokasi?: string;
  created_at: string;
  updated_at: string;
}

// Karyawan types
export interface Karyawan {
  id_karyawan: number;
  nama_karyawan: string;
  jabatan: string;
  nip?: string;
  no_hp?: string;
  alamat?: string;
  status_aktif: boolean;
  created_at: string;
  updated_at: string;
}

// Supplier types
export interface Supplier {
  id_supplier: number;
  nama_supplier: string;
  alamat?: string;
  kontak?: string;
  created_at: string;
  updated_at: string;
}

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

// Log Activity types
export interface LogActivity {
  id_log: number;
  id_user: number | null;
  waktu: string;
  aksi: string;
  deskripsi: string | null;
  ip_address: string | null;
  created_at: string;
}

// Transaksi Masuk types
export interface DetailTransaksiMasuk {
  id_detail_masuk: number;
  id_transaksi_masuk: number;
  id_barang: number;
  jumlah: number;
  harga_satuan: number;
  tanggal_kadaluarsa: string | null;
  created_at: string;
  updated_at: string;
  nama_barang?: string; // For display
}

export interface TransaksiMasuk {
  id_transaksi_masuk: number;
  tanggal_masuk: string;
  id_supplier: number | null;
  id_user: number | null;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
  nama_supplier?: string; // For display
  username?: string; // For display
  details?: DetailTransaksiMasuk[];
}

// Transaksi Keluar types
export interface DetailTransaksiKeluar {
  id_detail_keluar: number;
  id_transaksi_keluar: number;
  id_barang: number;
  jumlah: number;
  created_at: string;
  updated_at: string;
  nama_barang?: string; // For display
}

export interface TransaksiKeluar {
  id_transaksi_keluar: number;
  tanggal_keluar: string;
  tujuan: string;
  id_user: number | null;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
  username?: string; // For display
  details?: DetailTransaksiKeluar[];
}
