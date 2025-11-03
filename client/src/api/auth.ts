import apiClient from "./client";
import type { User, LoginResponse, ApiResponse } from "../types";

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      credentials
    );
    if (response.data.success) {
      const data = response.data.data as LoginResponse;
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data;
    }
    throw new Error(response.data.message || "Login failed");
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      "/auth/register",
      data
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Registration failed");
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refreshToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/profile");
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to get profile");
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      "/auth/profile",
      data
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update profile");
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    const response = await apiClient.put<ApiResponse<void>>(
      "/auth/change-password",
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to change password");
    }
  },

  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await apiClient.post<ApiResponse<{ token: string }>>(
      "/auth/refresh",
      { refreshToken }
    );
    if (response.data.success && "data" in response.data) {
      const data = response.data.data as { token: string };
      localStorage.setItem("accessToken", data.token);
      return data.token;
    }
    throw new Error(response.data.message || "Failed to refresh token");
  },
};
