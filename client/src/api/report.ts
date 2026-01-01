import client from "./client";
import type { ApiResponse } from "../types";

export const reportService = {
  /**
   * Get stock card for a product
   */
  getStockCard: async (
    productId: number,
    startDate?: string,
    endDate?: string
  ) => {
    const response = await client.get<ApiResponse<any>>(
      `reports/stock-card/${productId}`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data.data;
  },

  /**
   * Get all transactions
   */
  getAllTransactions: async (params: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
  }) => {
    const response = await client.get<ApiResponse<any>>(
      "reports/transactions",
      { params }
    );
    return response.data;
  },
};

export default reportService;
