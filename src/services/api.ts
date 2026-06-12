import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/lib/env";
import {
  getAccessToken,
  notifyAuthExpired,
  setAccessToken,
} from "./authToken";

/**
 * Shared axios instance for all backend calls.
 *
 * Cross-origin setup (frontend on Vercel, API on the VPS):
 *   - baseURL is env-driven (NEXT_PUBLIC_API_URL) — never hardcoded.
 *   - withCredentials: true so the httpOnly refresh cookie is sent on
 *     credentialed requests (login, refresh, logout). The browser only
 *     includes it when the API responds with the matching
 *     Access-Control-Allow-Credentials + a specific Allow-Origin (handled by
 *     Caddy at the edge).
 *
 * Access token (short-lived) is attached from the in-memory holder on each
 * request. On a 401 we attempt ONE refresh (single-flight) and retry.
 */
export const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach the in-memory access token ──────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ── Response: refresh-on-401 with single-flight de-duplication ──────────────
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Endpoints that must NOT trigger the refresh loop.
const NO_REFRESH_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/refresh",
  "/api/v1/auth/register",
];

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Hit /auth/refresh once; the refresh cookie travels automatically via
 * credentials. Returns the new access token, or null if the session is dead.
 * Uses a bare axios call so it never recurses through this interceptor.
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post<{ access_token: string }>(
      `${env.apiUrl}/api/v1/auth/refresh`,
      {},
      { withCredentials: true, timeout: 15000 },
    );
    const next = res.data.access_token;
    setAccessToken(next);
    return next;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";

    const isAuthEndpoint = NO_REFRESH_PATHS.some((p) => url.includes(p));
    if (status !== 401 || !original || original._retried || isAuthEndpoint) {
      return Promise.reject(error);
    }

    original._retried = true;

    // Coalesce concurrent 401s into one refresh round-trip.
    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
    const newToken = await refreshInFlight;

    if (!newToken) {
      notifyAuthExpired();
      return Promise.reject(error);
    }

    original.headers.set("Authorization", `Bearer ${newToken}`);
    return api(original);
  },
);
