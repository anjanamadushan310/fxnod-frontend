"use client";

import { create } from "zustand";
import { authApi, type UserPublic } from "@/services/authApi";
import {
  registerAuthExpiredHandler,
  setAccessToken,
} from "@/services/authToken";

/**
 * Auth state (Zustand). Holds the access token + current user in memory only.
 *
 * Refresh is invisible here — the axios interceptor handles silent refresh via
 * the httpOnly cookie. This store only learns about a DEAD session (refresh
 * failed) through the registered `auth-expired` handler.
 *
 * On a hard reload the in-memory token is gone; `bootstrap()` asks /users/me
 * which triggers a cookie-based refresh, transparently restoring the session
 * if the refresh cookie is still valid.
 */
interface AuthState {
  user: UserPublic | null;
  status: "idle" | "loading" | "authenticated" | "anonymous";
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // When a refresh ultimately fails, the api layer calls this.
  registerAuthExpiredHandler(() => {
    set({ user: null, status: "anonymous" });
  });

  return {
    user: null,
    status: "idle",

    async login(email, password) {
      set({ status: "loading" });
      const { access_token } = await authApi.login(email, password);
      setAccessToken(access_token);
      const user = await authApi.me();
      set({ user, status: "authenticated" });
    },

    async logout() {
      try {
        await authApi.logout();
      } finally {
        setAccessToken(null);
        set({ user: null, status: "anonymous" });
      }
    },

    async bootstrap() {
      set({ status: "loading" });
      try {
        // No access token in memory after a reload → /users/me 401 → the
        // interceptor refreshes via cookie → retry succeeds if still valid.
        const user = await authApi.me();
        set({ user, status: "authenticated" });
      } catch {
        set({ user: null, status: "anonymous" });
      }
    },
  };
});
