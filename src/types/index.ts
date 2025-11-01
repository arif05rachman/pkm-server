import { Request } from "express";

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user" | "manager";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user" | "manager";
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
