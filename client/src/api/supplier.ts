import apiClient from "./client";
import type { Supplier, ApiResponse, PaginatedResponse } from "../types";

interface CreateSupplierRequest {
  name: string;
  address?: string;
  contact?: string;
}

interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export const supplierService = {
  getAll: async (
    page = 1,
    limit = 10,
    searchTerm?: string
  ): Promise<PaginatedResponse<Supplier>> => {
    const params: any = { page, limit };
    if (searchTerm) params.q = searchTerm;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Supplier>>
    >("/suppliers", { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await apiClient.get<ApiResponse<Supplier>>(
      `/suppliers/${id}`
    );
    return response.data.data;
  },

  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Supplier>> => {
    return supplierService.getAll(page, limit, query);
  },

  create: async (data: CreateSupplierRequest): Promise<Supplier> => {
    const response = await apiClient.post<ApiResponse<Supplier>>(
      "/suppliers",
      data
    );
    return response.data.data;
  },

  update: async (
    id: number,
    data: UpdateSupplierRequest
  ): Promise<Supplier> => {
    const response = await apiClient.put<ApiResponse<Supplier>>(
      `/suppliers/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};

export default supplierService;
