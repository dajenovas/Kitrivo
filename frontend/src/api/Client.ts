/**
 * httpClient.ts
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

// ─── Environment / Config ──────────────────────────────────────────────────

const API_BASE_URL = config.baseURL;
const REQUEST_TIMEOUT_MS = config.timeout;

const STORAGE_KEYS = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  REFRESH_TOKEN: "REFRESH_TOKEN",
  TOKEN_EXPIRY: "TOKEN_EXPIRY",
} as const;

// ─── Token Helpers ──────────────────────────────────────────────────────────
// Single source of truth for auth token storage — AuthService (and anything
// else that needs to read/write tokens) should go through this, not localStorage directly.

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
// While a refresh is in flight, park every failed request's retry callback here
// instead of firing off multiple parallel refresh calls.

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

  const { data } = await refreshClient.post<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }>("/auth/refresh-token", { refresh_token: refreshToken });

  tokenStore.setTokens(data.access_token, data.refresh_token, data.expires_in);
  return data.access_token;
}

function redirectToLogin() {
  tokenStore.clearTokens();
  if (typeof window !== "undefined") {
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
    const isAuthEndpoint = failedRequest?.url?.includes("/auth/");

    if (status !== 401 || !failedRequest || isAuthEndpoint || failedRequest._hasRetried) {
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