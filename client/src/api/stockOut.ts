import apiClient from "./client";
import type { StockOut, ApiResponse, PaginatedResponse } from "../types";

interface CreateStockOutRequest {
  date: string;
  destination: string;
  user_id?: number;
  description?: string;
  details: {
    product_id: number;
    quantity: number;
  }[];
}

interface UpdateStockOutRequest {
  date?: string;
  destination?: string;
  user_id?: number;
  description?: string;
}

export const stockOutService = {
  getAll: async (
    page = 1,
    limit = 10,
    filters?: {
      startDate?: string;
      endDate?: string;
      destination?: string;
    }
  ): Promise<PaginatedResponse<StockOut>> => {
    const params: Record<string, string | number | undefined> = { page, limit };
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.destination) params.destination = filters.destination;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<StockOut>>
    >("/stock-out", { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<StockOut> => {
    const response = await apiClient.get<ApiResponse<StockOut>>(
      `/stock-out/${id}`
    );
    return response.data.data;
  },

  create: async (data: CreateStockOutRequest): Promise<StockOut> => {
    const response = await apiClient.post<ApiResponse<StockOut>>(
      "/stock-out",
      data
    );
    return response.data.data;
  },

  update: async (
    id: number,
    data: UpdateStockOutRequest
  ): Promise<StockOut> => {
    const response = await apiClient.put<ApiResponse<StockOut>>(
      `/stock-out/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/stock-out/${id}`);
  },
};

export default stockOutService;
