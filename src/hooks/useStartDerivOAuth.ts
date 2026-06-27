"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DERIV_INTENT_KEY,
  DERIV_RETURN_TO_KEY,
  DERIV_STATE_KEY,
} from "@/app/deriv/callback/CallbackInner";
import { derivApi } from "@/services/tradingApi";
import { useAuthStore } from "@/stores/authStore";

/**
 * Kicks off the Deriv OAuth round-trip — shared by the TopBar "Connect Deriv"
 * control and the login modal's "Continue with Deriv" button.
 *
 * Calls OUR backend's `/api/v1/deriv/oauth/authorize`, which returns the Deriv
 * authorize URL + a CSRF `state`. We stash the state (the callback validates
 * it on `/link`) and hand the browser off to Deriv.
 *
 * ⚠️ Backend coupling: `/oauth/authorize` is currently bearer-auth protected,
 * so for a logged-OUT visitor this returns 401 and we surface a toast. Once
 * Deriv OAuth is the primary login, the backend must allow unauthenticated
 * requests to that endpoint (or expose a public `…/deriv/login`) — see the
 * 401 branch below.
 */
export function useStartDerivOAuth() {
  const [redirecting, setRedirecting] = useState(false);

  async function start() {
    setRedirecting(true);
    try {
      const { authorize_url, state } = await derivApi.authorize();
      sessionStorage.setItem(DERIV_STATE_KEY, state);
      // Capture intent NOW (authenticated → link, else → Deriv-as-login) so the
      // callback doesn't have to race the auth bootstrap to decide.
      const intent =
        useAuthStore.getState().status === "authenticated" ? "link" : "login";
      sessionStorage.setItem(DERIV_INTENT_KEY, intent);
      // Remember where we started so the callback can return the user here.
      sessionStorage.setItem(
        DERIV_RETURN_TO_KEY,
        window.location.pathname + window.location.search,
      );
      window.location.href = authorize_url;
    } catch (e) {
      setRedirecting(false);
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        toast.error("Deriv sign-in isn’t available yet", {
          description:
            "The authorize endpoint still requires an existing session. Backend must allow unauthenticated /deriv/oauth/authorize.",
        });
        return;
      }
      toast.error("Couldn’t start Deriv sign-in", {
        description: detailOf(e) ?? "Please try again.",
      });
    }
  }

  return { start, redirecting };
}

function detailOf(e: unknown): string | null {
  return (
    (e as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? null
  );
}
