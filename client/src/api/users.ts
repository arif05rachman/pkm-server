import apiClient from "./client";
import type { User, ApiResponse, PaginatedResponse } from "../types";

interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: "admin" | "manager" | "user";
  is_active?: boolean;
  id_karyawan?: number;
}

export const usersApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      "/users",
      { params: { page, limit } }
    );
    return response.data.data!;
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },

  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      data
    );
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
