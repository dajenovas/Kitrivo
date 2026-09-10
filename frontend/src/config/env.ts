type Environment = "Development" | "Production" | "Staging";

const ENV = (import.meta.env.BASE_URL ?? "Development") as Environment;

const BASE_URLS: Record<Environment, string> = {
    Development:  'http://127.0.0.1:8000/api/v1/',
    Staging:      'http://127.0.0.1:8000/api/v1/',
    Production:   'http://127.0.0.1:8000/api/v1/',
}

export const config = {
    env: ENV,
    baseURL: BASE_URLS[ENV] ?? BASE_URLS.Development,
    timeout: 30_000,
} as const