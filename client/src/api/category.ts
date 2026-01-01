import api from "./client";
import type { Category, ApiResponse, PaginatedResponse } from "../types";

export const categoryService = {
  /**
   * Get all categories with pagination
   */
  getAll: async (
    page = 1,
    limit = 10,
    searchTerm?: string
  ): Promise<ApiResponse<PaginatedResponse<Category>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (searchTerm) params.append("q", searchTerm);
    const response = await api.get(`/categories?${params.toString()}`);
    return response.data;
  },

  /**
   * Search categories
   */
  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Category>>> => {
    return categoryService.getAll(page, limit, query);
  },

  /**
   * Get category by ID
   */
  getById: async (id: number): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Create a new category
   */
  create: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  /**
   * Update category by ID
   */
  update: async (
    id: number,
    data: Partial<Category>
  ): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Delete category by ID
   */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
