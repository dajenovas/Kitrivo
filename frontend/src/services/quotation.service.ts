import { apiClient } from "@/api/Client";
import type { ApiResponse } from "@/models/common.models";
import type { QuotationCheckoutPayload, QuotationCreatePayload, QuotationModel, QuotationUpdatePayload } from "@/models/quotation.models";



export const QuotationService = {
  createQuotation: async (payload: QuotationCreatePayload): Promise<ApiResponse<QuotationModel>> => {
    return await apiClient.post<ApiResponse<QuotationModel>>("/quotations", payload);
  },

  getAllQuotations: async (search?: string, status?: string): Promise<ApiResponse<QuotationModel[]>> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const queryString = params.toString();
    return await apiClient.get<ApiResponse<QuotationModel[]>>(`/quotations${queryString ? `?${queryString}` : ""}`);
  },

  getQuotationById: async (quoteId: string): Promise<ApiResponse<QuotationModel>> => {
    return await apiClient.get<ApiResponse<QuotationModel>>(`/quotations/${quoteId}`);
  },

  updateQuotation: async (quoteId: string, payload: QuotationUpdatePayload): Promise<ApiResponse<QuotationModel>> => {
    return await apiClient.put<ApiResponse<QuotationModel>>(`/quotations/${quoteId}`, payload);
  },

  checkoutQuotation: async (quoteId: string, payload: QuotationCheckoutPayload): Promise<ApiResponse<QuotationModel>> => {
    return await apiClient.post<ApiResponse<QuotationModel>>(`/quotations/${quoteId}/checkout`, payload);
  },
};

