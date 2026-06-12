import { env } from "@/lib/env";
import { getAccessToken } from "./authToken";

/**
 * Build a WebSocket URL against the env-configured WS origin.
 *
 *   buildWsUrl("/ws/prices")            → wss://api.fxnod.com/ws/prices
 *   buildWsUrl("/ws/prices", { sym })   → wss://api.fxnod.com/ws/prices?sym=…
 *
 * Browsers can't set Authorization headers on a WebSocket handshake, so the
 * access token is passed as a query param (`access_token`). The Trading
 * service reads it from the query when the connection isn't behind the NGINX
 * auth_request gate. Never log the resulting URL — it carries the token.
 */
export function buildWsUrl(
  path: string,
  params: Record<string, string | number | undefined> = {},
): string {
  const base = env.wsUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(base + cleanPath);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const token = getAccessToken();
  if (token) url.searchParams.set("access_token", token);

  return url.toString();
}
