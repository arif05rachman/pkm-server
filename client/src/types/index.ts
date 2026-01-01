// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "manager" | "user";
  is_active: boolean;
  employee_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  unit: "pcs" | "bottle" | "tablet";
  type: "Medicine" | "Medical Device" | "Medical Material";
  category_id: number | null;
  category_name?: string; // For display
  min_stock: number;
  stock: number;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Employee types
export interface Employee {
  id: number;
  name: string;
  position: string;
  nip?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Supplier types
export interface Supplier {
  id: number;
  name: string;
  address?: string;
  contact?: string;
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

// Stock In types
export interface StockInDetail {
  id: number;
  stock_in_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
  product_name?: string; // For display
}

export interface StockIn {
  id: number;
  date: string;
  supplier_id: number | null;
  user_id: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  supplier_name?: string; // For display
  username?: string; // For display
  details?: StockInDetail[];
}

// Stock Out types
export interface StockOutDetail {
  id: number;
  stock_out_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product_name?: string; // For display
}

export interface StockOut {
  id: number;
  date: string;
  destination: string;
  user_id: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  username?: string; // For display
  details?: StockOutDetail[];
}
