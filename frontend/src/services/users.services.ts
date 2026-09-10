import { apiClient } from "@/api/Client";
import type { UserProfile } from "@/models/auth.models";
import type { ApiResponse } from "@/models/common.models";

export interface CreateUserPayload {
    email: string;
    username: string;
    employee_id: string;
    full_name: string;
    profile_picture?: string;
    is_active: boolean;
    password: string;
    role_ids: number[];
}

export interface UpdateUserPayload {
    email?: string;
    username?: string;
    employee_id?: string;
    full_name?: string;
    profile_picture?: string;
    is_active?: boolean;
    password?: string;
    role_ids?: number[];
}

export interface UpdateMyProfilePayload {
    full_name?: string;
    profile_picture?: string;
}

export const UserServices = {
    listAllUsers: async (skip: number = 0, limit: number = 100): Promise<ApiResponse<UserProfile[]>> => {
        return await apiClient.get<ApiResponse<UserProfile[]>>(`/users?skip=${skip}&limit=${limit}`);
    },
    getUserById: async (id: number): Promise<ApiResponse<UserProfile>> => {
        return await apiClient.get<ApiResponse<UserProfile>>(`/users/${id}`);
    },
    createUser: async (payload: CreateUserPayload): Promise<ApiResponse<UserProfile>> => {
        return await apiClient.post<ApiResponse<UserProfile>>(`/users`, payload);
    },
    updateUser: async (id: number, payload: UpdateUserPayload): Promise<ApiResponse<UserProfile>> => {
        return await apiClient.put<ApiResponse<UserProfile>>(`/users/${id}`, payload);
    },
    deleteUser: async (id: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete<ApiResponse<null>>(`/users/${id}`);
    },
    resetPassword: async (id: number, new_password: string): Promise<ApiResponse<UserProfile>> => {
        return await apiClient.post<ApiResponse<UserProfile>>(`/users/${id}/reset-password`, { new_password });
    },
    updateMyProfile: async (payload: UpdateMyProfilePayload): Promise<ApiResponse<UserProfile>> => {
        return await apiClient.put<ApiResponse<UserProfile>>(`/auth/me/profile`, payload);
    }
};