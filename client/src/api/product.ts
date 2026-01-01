import apiClient from "./client";
import type { Product, ApiResponse, PaginatedResponse } from "../types";

interface CreateProductRequest {
  name: string;
  unit: "pcs" | "bottle" | "tablet";
  category_id?: number;
  min_stock?: number;
  location?: string;
}

interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export const productService = {
  getAll: async (
    page = 1,
    limit = 10,
    unit?: string,
    category?: number,
    searchTerm?: string
  ): Promise<PaginatedResponse<Product>> => {
    const params: any = { page, limit };
    if (unit) params.unit = unit;
    if (category) params.category = category;
    if (searchTerm) params.q = searchTerm;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Product>>
    >("/products", { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/products/${id}`
    );
    return response.data.data;
  },

  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Product>> => {
    return productService.getAll(page, limit, undefined, undefined, query);
  },

  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>(
      "/products",
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(
      `/products/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

export default productService;
