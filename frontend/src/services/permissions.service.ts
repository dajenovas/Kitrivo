import { apiClient } from "@/api/Client";
import type { Permission } from "@/models/auth.models";
import type { ApiResponse } from "@/models/common.models";

export interface CreatePermissionPayload {
    name: string;
    code: string;
    module?: string;
    description?: string;
    is_menu?: boolean;
    icon?: string;
    path?: string;
    sort_order?: number;
}

export interface UpdatePermissionPayload {
    name?: string;
    code?: string;
    module?: string;
    description?: string;
    is_menu?: boolean;
    icon?: string;
    path?: string;
    sort_order?: number;
}

export interface GroupedPermissionsModule {
    module: string;
    permissions: Permission[];
}

export const PermissionServices = {
    listPermissions: async (skip: number = 0, limit: number = 100, is_menu?: boolean, module?: string): Promise<ApiResponse<Permission[]>> => {
        let url = `/permissions?skip=${skip}&limit=${limit}`;
        if (is_menu !== undefined) url += `&is_menu=${is_menu}`;
        if (module) url += `&module=${encodeURIComponent(module)}`;
        return await apiClient.get<ApiResponse<Permission[]>>(url);
    },
    getGroupedPermissions: async (): Promise<ApiResponse<GroupedPermissionsModule[]>> => {
        return await apiClient.get<ApiResponse<GroupedPermissionsModule[]>>(`/permissions/grouped`);
    },
    getPermissionById: async (id: number): Promise<ApiResponse<Permission>> => {
        return await apiClient.get<ApiResponse<Permission>>(`/permissions/${id}`);
    },
    createPermission: async (payload: CreatePermissionPayload): Promise<ApiResponse<Permission>> => {
        return await apiClient.post<ApiResponse<Permission>>(`/permissions`, payload);
    },
    updatePermission: async (id: number, payload: UpdatePermissionPayload): Promise<ApiResponse<Permission>> => {
        return await apiClient.put<ApiResponse<Permission>>(`/permissions/${id}`, payload);
    },
    deletePermission: async (id: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete<ApiResponse<null>>(`/permissions/${id}`);
    }
};
