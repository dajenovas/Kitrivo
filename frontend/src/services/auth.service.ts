import { apiClient, tokenStore } from "@/api/Client";
import type { LoginResponse, UserProfile } from "@/models/auth.models";
import type { ApiResponse } from "@/models/common.models";
import { useAuthStore } from "@/store/useAuthStore";

export interface CredentialsTypes {
    username: string;
    password: string;
}

export const AuthService = {
    login: async (credentials: CredentialsTypes): Promise<LoginResponse> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>(`/auth/login`, credentials);
        const { access_token, refresh_token, expires_in, user } = response.data;
        tokenStore.setTokens(access_token, refresh_token, expires_in);
        if (user) {
            useAuthStore.getState().setUser(user);
        }
        return response.data;
    },

    getProfile: async (): Promise<UserProfile> => {
        const response = await apiClient.get<ApiResponse<UserProfile>>(`/auth/me`);
        return response.data;
    },

    logout: async (): Promise<void> => {
        const access_token = tokenStore.getAccessToken();
        const refresh_token = tokenStore.getRefreshToken();
        if (access_token || refresh_token) {
            try {
                await apiClient.post<ApiResponse<null>>(`/auth/logout`, {
                    access_token: access_token || "",
                    refresh_token: refresh_token || "",
                });
            } catch (error) {
                console.error("Logout request failed:", error);
            }
        }
        tokenStore.clearTokens();
        useAuthStore.getState().clearAuth();
    },
};