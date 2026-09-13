import { apiClient } from "@/api/Client";
import type { ApiResponse } from "@/models/common.models";

export interface AuditLogItem {
  id: number;
  user_id?: number | null;
  user_email?: string | null;
  user_name?: string | null;
  user_role?: string | null;
  action: string;
  module: string;
  entity_type?: string | null;
  entity_id?: string | null;
  description: string;
  changes_diff?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface AuditLogListPayload {
  items: AuditLogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LogFilterParams {
  search?: string;
  module?: string;
  action?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export const LogsService = {
  getLogs: async (params: LogFilterParams = {}): Promise<ApiResponse<AuditLogListPayload>> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append("search", params.search);
    if (params.module && params.module !== "ALL") searchParams.append("module", params.module);
    if (params.action && params.action !== "ALL") searchParams.append("action", params.action);
    if (params.user_id) searchParams.append("user_id", String(params.user_id));
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);
    if (params.page) searchParams.append("page", String(params.page));
    if (params.page_size) searchParams.append("page_size", String(params.page_size));

    const queryString = searchParams.toString();
    return await apiClient.get<ApiResponse<AuditLogListPayload>>(`/logs${queryString ? `?${queryString}` : ""}`);
  },

  getLogModules: async (): Promise<ApiResponse<string[]>> => {
    return await apiClient.get<ApiResponse<string[]>>("/logs/modules");
  },

  getLogById: async (logId: number): Promise<ApiResponse<AuditLogItem>> => {
    return await apiClient.get<ApiResponse<AuditLogItem>>(`/logs/${logId}`);
  },
};
