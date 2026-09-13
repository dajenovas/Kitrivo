import { apiClient } from "@/api/Client";
import type { DashboardAnalyticsResponse } from "@/models/dashboard.models";
import type { ApiResponse } from "@/models/common.models";

export const DashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardAnalyticsResponse>> => {
    return await apiClient.get<ApiResponse<DashboardAnalyticsResponse>>("/dashboard/stats");
  },
};
