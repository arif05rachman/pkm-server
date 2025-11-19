import apiClient from "./client";
import type { LogActivity, ApiResponse, PaginatedResponse } from "../types";

export const logActivityApi = {
  getAll: async (
    page = 1,
    limit = 50,
    filters?: {
      id_user?: number;
      aksi?: string;
      startDate?: string;
      endDate?: string;
      ip_address?: string;
    }
  ): Promise<PaginatedResponse<LogActivity>> => {
    const params: Record<string, string | number | undefined> = { page, limit };
    if (filters?.id_user) params.id_user = filters.id_user;
    if (filters?.aksi) params.aksi = filters.aksi;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.ip_address) params.ip_address = filters.ip_address;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<LogActivity>>
    >("/logs", { params });
    return response.data.data!;
  },

  getById: async (id: number): Promise<LogActivity> => {
    const response = await apiClient.get<ApiResponse<LogActivity>>(
      `/logs/${id}`
    );
    return response.data.data!;
  },

  search: async (
    query: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<LogActivity>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<LogActivity>>
    >("/logs/search", { params: { q: query, page, limit } });
    return response.data.data!;
  },

  getByUserId: async (
    userId: number,
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<LogActivity>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<LogActivity>>
    >(`/logs/user/${userId}`, { params: { page, limit } });
    return response.data.data!;
  },
};
