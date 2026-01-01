import apiClient from "./client";
import type { User, ApiResponse, PaginatedResponse } from "../types";

interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: "admin" | "manager" | "user";
  is_active?: boolean;
  employee_id?: number | null;
}

export const userService = {
  getAll: async (
    page = 1,
    limit = 10,
    searchTerm?: string
  ): Promise<PaginatedResponse<User>> => {
    const params: any = { page, limit };
    if (searchTerm) params.q = searchTerm;

    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      "/users",
      { params }
    );
    return response.data.data;
  },

  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<User>> => {
    return userService.getAll(page, limit, query);
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

export default userService;
