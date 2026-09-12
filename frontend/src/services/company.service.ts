import { apiClient } from "@/api/Client";
import type { ApiResponse } from "@/models/common.models";
import type { Company, CompanyCreatePayload, CompanyUpdatePayload } from "@/models/company.models";

export interface FileUploadResult {
  url: string;
  filename: string;
  saved_name: string;
  file_type: string;
}

export const CompanyService = {
  getCompanies: async (): Promise<ApiResponse<Company[]>> => {
    return await apiClient.get<ApiResponse<Company[]>>("/companies");
  },

  getActiveCompany: async (): Promise<ApiResponse<Company | null>> => {
    return await apiClient.get<ApiResponse<Company | null>>("/companies/active");
  },

  getCompanyById: async (companyId: number): Promise<ApiResponse<Company>> => {
    return await apiClient.get<ApiResponse<Company>>(`/companies/${companyId}`);
  },

  createCompany: async (payload: CompanyCreatePayload): Promise<ApiResponse<Company>> => {
    return await apiClient.post<ApiResponse<Company>>("/companies", payload);
  },

  updateCompany: async (companyId: number, payload: CompanyUpdatePayload): Promise<ApiResponse<Company>> => {
    return await apiClient.put<ApiResponse<Company>>(`/companies/${companyId}`, payload);
  },

  setActiveCompany: async (companyId: number): Promise<ApiResponse<Company>> => {
    return await apiClient.post<ApiResponse<Company>>(`/companies/${companyId}/activate`);
  },

  deleteCompany: async (companyId: number): Promise<ApiResponse<{ deleted_id: number }>> => {
    return await apiClient.delete<ApiResponse<{ deleted_id: number }>>(`/companies/${companyId}`);
  },

  uploadLogo: async (file: File): Promise<ApiResponse<FileUploadResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    return await apiClient.post<ApiResponse<FileUploadResult>>("/upload/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
