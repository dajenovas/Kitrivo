import axios from 'axios';
import { siteConfig } from '@/config/site';

/**
 * Public Showcase client. Intentionally has NO auth handling:
 * the Showcase Portal only reads published content and submits orders/inquiries.
 */
export const http = axios.create({
  baseURL: siteConfig.apiBaseUrl,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

export const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { detail?: unknown; message?: unknown } | undefined;
    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data?.message === 'string') return data.message;
    if (err.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!err.response) return 'Unable to reach the server. Check your connection and try again.';
    return `Request failed (${err.response.status}).`;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
};
