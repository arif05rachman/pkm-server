import { Request } from "express";

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user" | "manager";
  is_active: boolean;
  employee_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user" | "manager";
  employee_id?: number;
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

// Employee types
export interface Employee {
  id: number;
  name: string;
  position: string;
  nip: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmployeeRequest {
  name: string;
  position: string;
  nip?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface UpdateEmployeeRequest {
  name?: string;
  position?: string;
  nip?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  unit: "pcs" | "bottle" | "tablet";
  type: "Medicine" | "Medical Device" | "Medical Material";
  category_id: number | null;
  min_stock: number;
  stock: number;
  location: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductRequest {
  name: string;
  unit: "pcs" | "bottle" | "tablet";
  type: "Medicine" | "Medical Device" | "Medical Material";
  category_id?: number;
  min_stock?: number;
  location?: string;
}

export interface UpdateProductRequest {
  name?: string;
  unit?: "pcs" | "bottle" | "tablet";
  type?: "Medicine" | "Medical Device" | "Medical Material";
  category_id?: number;
  min_stock?: number;
  location?: string;
}

// Supplier types
export interface Supplier {
  id: number;
  name: string;
  address: string | null;
  contact: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSupplierRequest {
  name: string;
  address?: string;
  contact?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  address?: string;
  contact?: string;
}

// Stock In types
export interface StockIn {
  id: number;
  date: Date;
  supplier_id: number | null;
  user_id: number | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface StockInDetail {
  id: number;
  stock_in_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  expiry_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface StockInWithDetails extends StockIn {
  details: StockInDetail[];
}

export interface CreateStockInRequest {
  date: string;
  supplier_id?: number;
  user_id?: number;
  description?: string;
  details: CreateStockInDetailRequest[];
}

export interface CreateStockInDetailRequest {
  product_id: number;
  quantity: number;
  unit_price: number;
  expiry_date?: string;
}

export interface UpdateStockInRequest {
  date?: string;
  supplier_id?: number;
  user_id?: number;
  description?: string;
}

export interface UpdateStockInDetailRequest {
  product_id?: number;
  quantity?: number;
  unit_price?: number;
  expiry_date?: string;
}

// Stock Out types
export interface StockOut {
  id: number;
  date: Date;
  destination: string;
  user_id: number | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface StockOutDetail {
  id: number;
  stock_out_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface StockOutWithDetails extends StockOut {
  details: StockOutDetail[];
}

export interface CreateStockOutRequest {
  date: string;
  destination: string;
  user_id?: number;
  description?: string;
  details: CreateStockOutDetailRequest[];
}

export interface CreateStockOutDetailRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateStockOutRequest {
  date?: string;
  destination?: string;
  user_id?: number;
  description?: string;
}

export interface UpdateStockOutDetailRequest {
  product_id?: number;
  quantity?: number;
}
