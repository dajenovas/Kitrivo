import { apiClient } from "@/api/Client";
import type { BillCreatePayload, BillModel } from "@/models/bill.models";
import type { ApiResponse } from "@/models/common.models";

export const BillService = {
  getAllBills: async (search?: string, paymentMethod?: string): Promise<ApiResponse<BillModel[]>> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (paymentMethod) params.append("payment_method", paymentMethod);
    const queryString = params.toString();
    return await apiClient.get<ApiResponse<BillModel[]>>(`/bills${queryString ? `?${queryString}` : ""}`);
  },

  getBillByNumber: async (billNumber: string): Promise<ApiResponse<BillModel>> => {
    return await apiClient.get<ApiResponse<BillModel>>(`/bills/${billNumber}`);
  },

  createBill: async (payload: BillCreatePayload): Promise<ApiResponse<BillModel>> => {
    return await apiClient.post<ApiResponse<BillModel>>("/bills", payload);
  },
};
