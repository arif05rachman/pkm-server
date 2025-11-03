import apiClient from './client';
import type { Karyawan, ApiResponse, PaginatedResponse } from '../types';

interface CreateKaryawanRequest {
  nama_karyawan: string;
  jabatan: string;
  nip?: string;
  no_hp?: string;
  alamat?: string;
  status_aktif?: boolean;
}

interface UpdateKaryawanRequest extends Partial<CreateKaryawanRequest> {}

export const karyawanApi = {
  getAll: async (
    page = 1,
    limit = 10,
    status_aktif?: boolean
  ): Promise<PaginatedResponse<Karyawan>> => {
    const params: any = { page, limit };
    if (status_aktif !== undefined) params.status_aktif = status_aktif;

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Karyawan>>>(
      '/karyawan',
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Karyawan> => {
    const response = await apiClient.get<ApiResponse<Karyawan>>(`/karyawan/${id}`);
    return response.data.data;
  },

  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Karyawan>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Karyawan>>>(
      '/karyawan/search',
      { params: { q: query, page, limit } }
    );
    return response.data.data;
  },

  create: async (data: CreateKaryawanRequest): Promise<Karyawan> => {
    const response = await apiClient.post<ApiResponse<Karyawan>>('/karyawan', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateKaryawanRequest): Promise<Karyawan> => {
    const response = await apiClient.put<ApiResponse<Karyawan>>(`/karyawan/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/karyawan/${id}`);
  },
};

