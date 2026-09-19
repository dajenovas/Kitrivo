const getBaseUrl = (): string => {
    const rawUrl = import.meta.env.VITE_API_BASE_URL || "https://kitrivo.vercel.app/api/v1/";
    return rawUrl.endsWith("/") ? rawUrl : `${rawUrl}/`;
};

export const config = {
    env: import.meta.env.MODE || "development",
    baseURL: getBaseUrl(),
    appTitle: import.meta.env.VITE_APP_TITLE || "Kitrivo Lab Equipment Management",
    timeout: Number(import.meta.env.VITE_TIMEOUT_MS) || 30_000,
} as const;