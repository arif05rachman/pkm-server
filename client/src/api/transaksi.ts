import apiClient from "./client";
import type {
  TransaksiMasuk,
  TransaksiKeluar,
  ApiResponse,
  PaginatedResponse,
} from "../types";

// Transaksi Masuk
interface CreateTransaksiMasukRequest {
  tanggal_masuk: string;
  id_supplier?: number;
  id_user?: number;
  keterangan?: string;
  details: {
    id_barang: number;
    jumlah: number;
    harga_satuan: number;
    tanggal_kadaluarsa?: string;
  }[];
}

interface UpdateTransaksiMasukRequest {
  tanggal_masuk?: string;
  id_supplier?: number;
  id_user?: number;
  keterangan?: string;
}

export const transaksiMasukApi = {
  getAll: async (
    page = 1,
    limit = 10,
    filters?: {
      startDate?: string;
      endDate?: string;
      id_supplier?: number;
    }
  ): Promise<PaginatedResponse<TransaksiMasuk>> => {
    const params: Record<string, string | number | undefined> = { page, limit };
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.id_supplier) params.id_supplier = filters.id_supplier;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<TransaksiMasuk>>
    >("/transaksi-masuk", { params });
    return response.data.data!;
  },

  getById: async (id: number): Promise<TransaksiMasuk> => {
    const response = await apiClient.get<ApiResponse<TransaksiMasuk>>(
      `/transaksi-masuk/${id}`
    );
    return response.data.data!;
  },

  create: async (
    data: CreateTransaksiMasukRequest
  ): Promise<TransaksiMasuk> => {
    const response = await apiClient.post<ApiResponse<TransaksiMasuk>>(
      "/transaksi-masuk",
      data
    );
    return response.data.data!;
  },

  update: async (
    id: number,
    data: UpdateTransaksiMasukRequest
  ): Promise<TransaksiMasuk> => {
    const response = await apiClient.put<ApiResponse<TransaksiMasuk>>(
      `/transaksi-masuk/${id}`,
      data
    );
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/transaksi-masuk/${id}`);
  },
};

// Transaksi Keluar
interface CreateTransaksiKeluarRequest {
  tanggal_keluar: string;
  tujuan: string;
  id_user?: number;
  keterangan?: string;
  details: {
    id_barang: number;
    jumlah: number;
  }[];
}

interface UpdateTransaksiKeluarRequest {
  tanggal_keluar?: string;
  tujuan?: string;
  id_user?: number;
  keterangan?: string;
}

export const transaksiKeluarApi = {
  getAll: async (
    page = 1,
    limit = 10,
    filters?: {
      startDate?: string;
      endDate?: string;
      tujuan?: string;
    }
  ): Promise<PaginatedResponse<TransaksiKeluar>> => {
    const params: Record<string, string | number | undefined> = { page, limit };
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.tujuan) params.tujuan = filters.tujuan;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<TransaksiKeluar>>
    >("/transaksi-keluar", { params });
    return response.data.data!;
  },

  getById: async (id: number): Promise<TransaksiKeluar> => {
    const response = await apiClient.get<ApiResponse<TransaksiKeluar>>(
      `/transaksi-keluar/${id}`
    );
    return response.data.data!;
  },

  create: async (
    data: CreateTransaksiKeluarRequest
  ): Promise<TransaksiKeluar> => {
    const response = await apiClient.post<ApiResponse<TransaksiKeluar>>(
      "/transaksi-keluar",
      data
    );
    return response.data.data!;
  },

  update: async (
    id: number,
    data: UpdateTransaksiKeluarRequest
  ): Promise<TransaksiKeluar> => {
    const response = await apiClient.put<ApiResponse<TransaksiKeluar>>(
      `/transaksi-keluar/${id}`,
      data
    );
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/transaksi-keluar/${id}`);
  },
};
