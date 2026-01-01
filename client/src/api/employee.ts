import apiClient from "./client";
import type { Employee, ApiResponse, PaginatedResponse } from "../types";

interface CreateEmployeeRequest {
  name: string;
  position: string;
  nip?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

export const employeeService = {
  getAll: async (
    page = 1,
    limit = 10,
    isActive?: boolean,
    searchTerm?: string
  ): Promise<PaginatedResponse<Employee>> => {
    const params: any = { page, limit };
    if (isActive !== undefined) params.is_active = isActive;
    if (searchTerm) params.q = searchTerm;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Employee>>
    >("/employees", { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await apiClient.get<ApiResponse<Employee>>(
      `/employees/${id}`
    );
    return response.data.data;
  },

  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Employee>> => {
    return employeeService.getAll(page, limit, undefined, query);
  },

  create: async (data: CreateEmployeeRequest): Promise<Employee> => {
    const response = await apiClient.post<ApiResponse<Employee>>(
      "/employees",
      data
    );
    return response.data.data;
  },

  update: async (
    id: number,
    data: UpdateEmployeeRequest
  ): Promise<Employee> => {
    const response = await apiClient.put<ApiResponse<Employee>>(
      `/employees/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },
};

export default employeeService;
