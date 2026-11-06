import { apiClient } from "@/api/Client";
import type { ApiResponse } from "@/models/common.models";
import type {
  Product,
  ProductCategory,
  ProductCreatePayload,
  ProductListResponse,
  ProductUpdatePayload,
} from "@/models/product.models";

export interface ListProductsParams {
  skip?: number;
  limit?: number;
  q?: string;
  category_id?: number;
  status?: string;
}

export interface FileUploadResult {
  url: string;
  filename: string;
  saved_name: string;
  file_type: string;
}

export const ProductService = {
  getProducts: async (params?: ListProductsParams): Promise<ApiResponse<ProductListResponse>> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.append("skip", params.skip.toString());
    if (params?.limit !== undefined) query.append("limit", params.limit.toString());
    if (params?.q) query.append("q", params.q);
    if (params?.category_id) query.append("category_id", params.category_id.toString());
    if (params?.status) query.append("status", params.status);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await apiClient.get<ApiResponse<ProductListResponse>>(`/products${queryString}`);
  },

  getProductById: async (productId: string | number): Promise<ApiResponse<Product>> => {
    return await apiClient.get<ApiResponse<Product>>(`/products/${productId}`);
  },

  createProduct: async (payload: ProductCreatePayload): Promise<ApiResponse<Product>> => {
    return await apiClient.post<ApiResponse<Product>>("/products", payload);
  },

  updateProduct: async (productId: string | number, payload: ProductUpdatePayload): Promise<ApiResponse<Product>> => {
    return await apiClient.put<ApiResponse<Product>>(`/products/${productId}`, payload);
  },

  deleteProduct: async (productId: string | number): Promise<ApiResponse<null>> => {
    return await apiClient.delete<ApiResponse<null>>(`/products/${productId}`);
  },

  listCategories: async (): Promise<ApiResponse<ProductCategory[]>> => {
    return await apiClient.get<ApiResponse<ProductCategory[]>>("/products/categories");
  },

  createCategory: async (payload: { name: string; code: string; description?: string }): Promise<ApiResponse<ProductCategory>> => {
    return await apiClient.post<ApiResponse<ProductCategory>>("/products/categories", payload);
  },

  uploadSingleFile: async (file: File): Promise<ApiResponse<FileUploadResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    return await apiClient.post<ApiResponse<FileUploadResult>>("/upload/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadMultipleFiles: async (files: File[]): Promise<ApiResponse<FileUploadResult[]>> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return await apiClient.post<ApiResponse<FileUploadResult[]>>("/upload/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

