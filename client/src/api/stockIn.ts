import apiClient from "./client";
import type { StockIn, ApiResponse, PaginatedResponse } from "../types";

interface CreateStockInRequest {
  date: string;
  supplier_id?: number;
  user_id?: number;
  description?: string;
  details: {
    product_id: number;
    quantity: number;
    unit_price: number;
    expiry_date?: string;
  }[];
}

interface UpdateStockInRequest {
  date?: string;
  supplier_id?: number;
  user_id?: number;
  description?: string;
}

export const stockInService = {
  getAll: async (
    page = 1,
    limit = 10,
    filters?: {
      startDate?: string;
      endDate?: string;
      supplier_id?: number;
    }
  ): Promise<PaginatedResponse<StockIn>> => {
    const params: Record<string, string | number | undefined> = { page, limit };
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.supplier_id) params.supplier_id = filters.supplier_id;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<StockIn>>
    >("/stock-in", { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<StockIn> => {
    const response = await apiClient.get<ApiResponse<StockIn>>(
      `/stock-in/${id}`
    );
    return response.data.data;
  },

  create: async (data: CreateStockInRequest): Promise<StockIn> => {
    const response = await apiClient.post<ApiResponse<StockIn>>(
      "/stock-in",
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateStockInRequest): Promise<StockIn> => {
    const response = await apiClient.put<ApiResponse<StockIn>>(
      `/stock-in/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/stock-in/${id}`);
  },
};

export default stockInService;
