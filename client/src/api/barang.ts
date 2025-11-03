import apiClient from './client';
import type { Barang, ApiResponse, PaginatedResponse } from '../types';

interface CreateBarangRequest {
  nama_barang: string;
  satuan: 'pcs' | 'botol' | 'tablet';
  jenis: 'Obat' | 'Alkes' | 'BMHP';
  stok_minimal?: number;
  lokasi?: string;
}

interface UpdateBarangRequest extends Partial<CreateBarangRequest> {}

export const barangApi = {
  getAll: async (
    page = 1,
    limit = 10,
    jenis?: string,
    satuan?: string
  ): Promise<PaginatedResponse<Barang>> => {
    const params: any = { page, limit };
    if (jenis) params.jenis = jenis;
    if (satuan) params.satuan = satuan;

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Barang>>>(
      '/barang',
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Barang> => {
    const response = await apiClient.get<ApiResponse<Barang>>(`/barang/${id}`);
    return response.data.data;
  },

  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Barang>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Barang>>>(
      '/barang/search',
      { params: { q: query, page, limit } }
    );
    return response.data.data;
  },

  create: async (data: CreateBarangRequest): Promise<Barang> => {
    const response = await apiClient.post<ApiResponse<Barang>>('/barang', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateBarangRequest): Promise<Barang> => {
    const response = await apiClient.put<ApiResponse<Barang>>(`/barang/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/barang/${id}`);
  },
};

