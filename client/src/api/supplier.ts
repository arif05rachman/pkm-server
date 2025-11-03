import apiClient from './client';
import type { Supplier, ApiResponse, PaginatedResponse } from '../types';

interface CreateSupplierRequest {
  nama_supplier: string;
  alamat?: string;
  kontak?: string;
}

interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export const supplierApi = {
  getAll: async (
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Supplier>> => {
    const params: any = { page, limit };

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Supplier>>>(
      '/supplier',
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await apiClient.get<ApiResponse<Supplier>>(`/supplier/${id}`);
    return response.data.data;
  },

  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Supplier>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Supplier>>>(
      '/supplier/search',
      { params: { q: query, page, limit } }
    );
    return response.data.data;
  },

  create: async (data: CreateSupplierRequest): Promise<Supplier> => {
    const response = await apiClient.post<ApiResponse<Supplier>>('/supplier', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateSupplierRequest): Promise<Supplier> => {
    const response = await apiClient.put<ApiResponse<Supplier>>(`/supplier/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/supplier/${id}`);
  },
};

