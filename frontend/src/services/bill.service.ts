import { apiClient } from "@/api/Client";
import type { BillCreatePayload, BillModel, PaymentCreatePayload, PaymentRecordModel } from "@/models/bill.models";
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

  recordPayment: async (billNumber: string, payload: PaymentCreatePayload): Promise<ApiResponse<BillModel>> => {
    return await apiClient.post<ApiResponse<BillModel>>(`/bills/${billNumber}/payments`, payload);
  },

  getPaymentHistory: async (billNumber: string): Promise<ApiResponse<PaymentRecordModel[]>> => {
    return await apiClient.get<ApiResponse<PaymentRecordModel[]>>(`/bills/${billNumber}/payments`);
  },

  sendBillEmail: async (billNumber: string, toEmail: string, customMessage?: string): Promise<ApiResponse<boolean>> => {
    return await apiClient.post<ApiResponse<boolean>>(`/bills/${billNumber}/send-email`, { to_email: toEmail, custom_message: customMessage });
  },
};
