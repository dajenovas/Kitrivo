import { apiClient } from "@/api/Client";
import type { CustomerModel, CustomerDetailModel, CustomerCreatePayload, CustomerUpdatePayload } from "@/models/customer.models";
import type { ApiResponse } from "@/models/common.models";

export const CustomerService = {
  getAllCustomers: async (search?: string, customerType?: string, state?: string, skip?: number, limit?: number): Promise<ApiResponse<CustomerModel[]>> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (customerType) params.append("customer_type", customerType);
    if (state) params.append("state", state);
    if (skip !== undefined) params.append("skip", String(skip));
    if (limit !== undefined) params.append("limit", String(limit));
    const queryString = params.toString();
    return await apiClient.get<ApiResponse<CustomerModel[]>>(`/customers${queryString ? `?${queryString}` : ""}`);
  },

  getCustomerById: async (customerId: number): Promise<ApiResponse<CustomerDetailModel>> => {
    return await apiClient.get<ApiResponse<CustomerDetailModel>>(`/customers/${customerId}`);
  },

  createCustomer: async (payload: CustomerCreatePayload): Promise<ApiResponse<CustomerModel>> => {
    return await apiClient.post<ApiResponse<CustomerModel>>("/customers", payload);
  },

  updateCustomer: async (customerId: number, payload: CustomerUpdatePayload): Promise<ApiResponse<CustomerModel>> => {
    return await apiClient.put<ApiResponse<CustomerModel>>(`/customers/${customerId}`, payload);
  },

  deleteCustomer: async (customerId: number): Promise<ApiResponse<{ id: number }>> => {
    return await apiClient.delete<ApiResponse<{ id: number }>>(`/customers/${customerId}`);
  },
};
