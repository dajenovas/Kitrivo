/**
 * Client.ts
 * Centralized Axios instance with:
 *  - Base URL / timeout config
 *  - Auth token attached to every outgoing request
 *  - Automatic refresh-token flow on 401, with request queueing
 *    (so parallel requests don't each trigger their own refresh call)
 */

import { config } from "@/config/env";
import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Environment / Config ──────────────────────────────────────────────────

const API_BASE_URL = config.baseURL;
const REQUEST_TIMEOUT_MS = config.timeout;

const STORAGE_KEYS = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  REFRESH_TOKEN: "REFRESH_TOKEN",
  TOKEN_EXPIRY: "TOKEN_EXPIRY",
} as const;

// ─── Token Helpers ──────────────────────────────────────────────────────────

const tokenStore = {
  getAccessToken: () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),

  getExpiry: (): number | null => {
    const value = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    return value ? Number(value) : null;
  },

  // True once the access token is expired, or within `bufferMs` of expiring.
  isExpired: (bufferMs = 30_000): boolean => {
    const expiry = tokenStore.getExpiry();
    if (!expiry) return true;
    return Date.now() >= expiry - bufferMs;
  },

  setTokens: (accessToken: string, refreshToken?: string, expiresInSeconds?: number) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    if (expiresInSeconds !== undefined) {
      const expiryTimestamp = Date.now() + expiresInSeconds * 1000;
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(expiryTimestamp));
    }
  },

  clearTokens: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  },
};

// ─── Axios Instance ─────────────────────────────────────────────────────────

const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

// A separate, un-intercepted instance for hitting the refresh endpoint itself,
// so the refresh call can never recursively trigger the response interceptor.
const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

// ─── Request Interceptor: attach access token ──────────────────────────────

httpClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const accessToken = tokenStore.getAccessToken();

    if (accessToken) {
      requestConfig.headers.Authorization = `Bearer ${accessToken}`;
    }

    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// ─── Refresh Queue ──────────────────────────────────────────────────────────

type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let requestQueue: QueuedRequest[] = [];

function flushQueue(error: unknown, newAccessToken: string | null) {
  requestQueue.forEach(({ resolve, reject }) => {
    if (newAccessToken) {
      resolve(newAccessToken);
    } else {
      reject(error);
    }
  });
  requestQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token found — user must re-authenticate");
  }

  const response = await refreshClient.post(
    "/auth/refresh",
    { refresh_token: refreshToken },
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  const resData = (response.data as any)?.data || response.data;
  const newAccessToken = resData?.access_token;
  const newRefreshToken = resData?.refresh_token;
  const expiresIn = resData?.expires_in;

  if (!newAccessToken) {
    throw new Error("Invalid token refresh response from server");
  }

  tokenStore.setTokens(newAccessToken, newRefreshToken || refreshToken, expiresIn);
  return newAccessToken;
}

function redirectToLogin() {
  tokenStore.clearTokens();
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
    window.location.assign("/login");
  }
}

// ─── Response Interceptor: retry once after refreshing on 401 ──────────────

interface RetriableConfig extends AxiosRequestConfig {
  _hasRetried?: boolean;
}

httpClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const failedRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const requestUrl = failedRequest?.url || "";

    // Exclude login and refresh endpoints from refresh retry logic
    const isExcludedEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/refresh");

    if (status !== 401 || !failedRequest || isExcludedEndpoint || failedRequest._hasRetried) {
      return Promise.reject(error);
    }

    failedRequest._hasRetried = true;

    if (isRefreshing) {
      // A refresh is already underway — wait for it instead of starting another.
      return new Promise((resolve, reject) => {
        requestQueue.push({
          resolve: (token) => {
            failedRequest.headers = {
              ...failedRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            resolve(httpClient(failedRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();
      flushQueue(null, newAccessToken);

      failedRequest.headers = {
        ...failedRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      return httpClient(failedRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Public API ─────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    httpClient.get<T>(url, config).then((res) => res.data),

  post: <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    httpClient.post<T>(url, body, config).then((res) => res.data),

  put: <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    httpClient.put<T>(url, body, config).then((res) => res.data),

  patch: <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    httpClient.patch<T>(url, body, config).then((res) => res.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    httpClient.delete<T>(url, config).then((res) => res.data),
};

export { tokenStore };
export default httpClient;