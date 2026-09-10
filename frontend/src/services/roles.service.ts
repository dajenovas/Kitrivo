import { apiClient } from "@/api/Client";
import type { UserRole } from "@/models/auth.models";
import type { ApiResponse } from "@/models/common.models";

export interface CreateRolePayload {
    name: string;
    code: string;
    description?: string;
    permission_ids?: number[];
}

export interface UpdateRolePayload {
    name?: string;
    code?: string;
    description?: string;
    permission_ids?: number[];
}

export const RoleServices = {
    listRoles: async (skip: number = 0, limit: number = 100): Promise<ApiResponse<UserRole[]>> => {
        return await apiClient.get<ApiResponse<UserRole[]>>(`/roles?skip=${skip}&limit=${limit}`);
    },
    getRoleById: async (id: number): Promise<ApiResponse<UserRole>> => {
        return await apiClient.get<ApiResponse<UserRole>>(`/roles/${id}`);
    },
    createRole: async (payload: CreateRolePayload): Promise<ApiResponse<UserRole>> => {
        return await apiClient.post<ApiResponse<UserRole>>(`/roles`, payload);
    },
    updateRole: async (id: number, payload: UpdateRolePayload): Promise<ApiResponse<UserRole>> => {
        return await apiClient.put<ApiResponse<UserRole>>(`/roles/${id}`, payload);
    },
    deleteRole: async (id: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete<ApiResponse<null>>(`/roles/${id}`);
    },
    assignPermissionsToRole: async (id: number, permission_ids: number[]): Promise<ApiResponse<UserRole>> => {
        return await apiClient.post<ApiResponse<UserRole>>(`/roles/${id}/permissions`, { permission_ids });
    }
};
