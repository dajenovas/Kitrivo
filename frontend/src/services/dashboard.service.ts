import { apiClient } from "@/api/Client";
import type { DashboardAnalyticsResponse } from "@/models/dashboard.models";
import type { ApiResponse } from "@/models/common.models";

import { config } from "@/config/env";

export const DashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardAnalyticsResponse>> => {
    return await apiClient.get<ApiResponse<DashboardAnalyticsResponse>>("/dashboard/stats");
  },

  exportReportUrl: (reportType: string = "bills"): string => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return `${config.baseURL}/dashboard/export?report_type=${reportType}&token=${token || ""}`;
  },
};
