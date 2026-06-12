/**
 * In-memory access-token holder.
 *
 * The access token is kept in memory only (never localStorage — XSS-safe per
 * PROJECT_PLAN). This tiny module is the single shared reference between the
 * axios interceptor (reads it) and the Zustand auth store (writes it),
 * avoiding a circular import between the two.
 *
 * The REFRESH token is never seen by JS — it lives in an httpOnly cookie set
 * by the auth service and is sent automatically on credentialed requests.
 */
let accessToken: string | null = null;

/** Called when a refresh fails / session ends — store registers a handler. */
let onAuthExpired: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function registerAuthExpiredHandler(fn: () => void): void {
  onAuthExpired = fn;
}

export function notifyAuthExpired(): void {
  accessToken = null;
  onAuthExpired?.();
}
