import { api } from "./api";

/**
 * Auth endpoints. All calls go through the credentialed axios instance, so
 * the refresh cookie is set (login) and sent (refresh/logout) automatically.
 *
 * The access token is returned in the response body and lives in memory; the
 * refresh token is NEVER in the body the SPA reads — it's the httpOnly cookie.
 */

export interface UserPublic {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  is_email_verified: boolean;
  is_active: boolean;
  kyc_status: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface DerivLoginPayload {
  /** CSRF state issued by /deriv/oauth/authorize at the start of the flow. */
  state: string;
  /** Deriv OAuth token for the chosen account. */
  token: string;
  /** Deriv loginid, e.g. CR123456 / VRTC987654. */
  deriv_account_id: string;
  currency?: string;
  is_virtual?: boolean;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/api/v1/auth/login", {
      email,
      password,
    });
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<{ user: UserPublic }> {
    const res = await api.post<{ user: UserPublic }>(
      "/api/v1/auth/register",
      payload,
    );
    return res.data;
  },

  /**
   * Deriv-as-login: mint an FXNod session from a Deriv OAuth token. PUBLIC
   * endpoint (no bearer) — sets the httpOnly refresh cookie and returns the
   * access token, same session shape as login().
   */
  async loginWithDeriv(payload: DerivLoginPayload): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/api/v1/auth/deriv", payload);
    return res.data;
  },

  async logout(): Promise<void> {
    // Refresh cookie identifies the session; no body needed.
    await api.post("/api/v1/auth/logout", {});
  },

  async me(): Promise<UserPublic> {
    const res = await api.get<UserPublic>("/api/v1/users/me");
    return res.data;
  },
};
