import { apiClient } from "@/api/Client";
import type { ApiResponse } from "@/models/common.models";
import type { ProductListResponse } from "@/models/product.models";

export interface ListResourceParams {
  skip?: number;
  limit?: number;
  q?: string;
  category_id?: number;
  has_manual?: boolean;
  has_video?: boolean;
}

export const ResourceService = {
  getLabManuals: async (params?: ListResourceParams): Promise<ApiResponse<ProductListResponse>> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.append("skip", params.skip.toString());
    if (params?.limit !== undefined) query.append("limit", params.limit.toString());
    if (params?.q) query.append("q", params.q);
    if (params?.category_id) query.append("category_id", params.category_id.toString());
    if (params?.has_manual !== undefined) query.append("has_manual", params.has_manual.toString());

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await apiClient.get<ApiResponse<ProductListResponse>>(`/resources/lab-manuals${queryString}`);
  },

  getDemoVideos: async (params?: ListResourceParams): Promise<ApiResponse<ProductListResponse>> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.append("skip", params.skip.toString());
    if (params?.limit !== undefined) query.append("limit", params.limit.toString());
    if (params?.q) query.append("q", params.q);
    if (params?.category_id) query.append("category_id", params.category_id.toString());
    if (params?.has_video !== undefined) query.append("has_video", params.has_video.toString());

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await apiClient.get<ApiResponse<ProductListResponse>>(`/resources/demo-videos${queryString}`);
  },
};
