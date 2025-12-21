import client from "./client";

export const reportApi = {
  getStockCard: async (
    id_barang: number,
    startDate?: string,
    endDate?: string
  ) => {
    const response = await client.get(`reports/stock-card/${id_barang}`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
  getAllTransactions: async (params: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
  }) => {
    const response = await client.get("reports/transactions", { params });
    return response.data;
  },
};
