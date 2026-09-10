// cookie.helpers.ts
export const COOKIE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TOKEN_EXPIRY_DURATION: "token_expiry_duration",
  TOKEN_EXPIRY_TIME: "token_expiry_time",
} as const;

const DEFAULT_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export function setCookie(name: string, value: string, maxAgeSeconds: number = DEFAULT_COOKIE_MAX_AGE): void {
  const maxAge = maxAgeSeconds > 0 ? maxAgeSeconds : DEFAULT_COOKIE_MAX_AGE;
  const cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = cookie;
}

export function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}