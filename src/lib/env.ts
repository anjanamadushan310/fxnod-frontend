/**
 * Typed, validated access to the public runtime config.
 *
 * Only NEXT_PUBLIC_* vars are available in the browser. We read them through
 * this module so there is exactly ONE place that knows the API/WS origin —
 * no `process.env.NEXT_PUBLIC_API_URL` scattered across the codebase, and no
 * hardcoded localhost/IP anywhere.
 *
 * In production (Vercel) both point at the VPS backend domain:
 *   NEXT_PUBLIC_API_URL = https://api.fxnod.com
 *   NEXT_PUBLIC_WS_URL   = wss://api.fxnod.com
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    // Fail loudly during build / first render rather than sending requests to
    // `undefined`. Vercel surfaces this in the build log.
    throw new Error(
      `Missing required env var ${name}. Set it in the Vercel dashboard ` +
        `(Project → Settings → Environment Variables) or in .env.local for dev.`,
    );
  }
  return value.replace(/\/+$/, ""); // strip trailing slashes for clean joins
}

export const env = {
  /** Backend REST base, e.g. https://api.fxnod.com (no trailing slash). */
  apiUrl: required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL),
  /** Backend WS base, e.g. wss://api.fxnod.com (no trailing slash). */
  wsUrl: required("NEXT_PUBLIC_WS_URL", process.env.NEXT_PUBLIC_WS_URL),
  /** True only in `next dev`. */
  isDev: process.env.NODE_ENV !== "production",
} as const;
