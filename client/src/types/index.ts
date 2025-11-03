// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
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
  satuan: 'pcs' | 'botol' | 'tablet';
  jenis: 'Obat' | 'Alkes' | 'BMHP';
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

