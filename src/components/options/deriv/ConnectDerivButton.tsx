"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DERIV_STATE_KEY } from "@/app/deriv/callback/CallbackInner";
import { useDerivStatus } from "@/hooks/useDerivStatus";
import { derivApi } from "@/services/tradingApi";
import { cn } from "@/lib/cn";

/**
 * Top-bar control for Deriv account linking.
 *
 *  - Reads link status via the Orval-generated `derivAccountStatus` query
 *    (→ GET /api/v1/deriv/account/status through the shared axios instance,
 *    so it honours NEXT_PUBLIC_API_URL + auth automatically).
 *  - When unlinked, starts the OAuth flow through OUR backend
 *    (`/api/v1/deriv/oauth/authorize`), which returns the Deriv authorize URL
 *    plus a CSRF `state`. We stash the state (the callback validates it on
 *    `/link`) and hand the browser off to Deriv.
 *
 * We deliberately use the backend-issued authorize URL rather than building
 * `oauth.deriv.com/...` on the client: the callback + link endpoint require
 * the backend-issued `state`, so a client-built URL would fail CSRF checks.
 */
export function ConnectDerivButton() {
  const [redirecting, setRedirecting] = useState(false);
  const { linked, accountId, isLoading } = useDerivStatus();

  async function connect() {
    setRedirecting(true);
    try {
      const { authorize_url, state } = await derivApi.authorize();
      sessionStorage.setItem(DERIV_STATE_KEY, state);
      window.location.href = authorize_url;
    } catch (e) {
      setRedirecting(false);
      toast.error("Couldn’t start Deriv connection", {
        description: detailOf(e) ?? "Please try again.",
      });
    }
  }

  if (linked) {
    return (
      <div
        className="flex flex-shrink-0 items-center gap-1.5 rounded-[10px] bg-opt-rise-soft px-3 py-1.5 text-[12px] font-medium text-opt-rise"
        title={`Linked Deriv account ${accountId ?? ""}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-opt-rise" />
        Deriv
        <span className="font-mono text-opt-ink-2">{accountId}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={redirecting || isLoading}
      className={cn(
        "flex flex-shrink-0 items-center gap-1.5 rounded-[10px] px-3 py-1.5",
        "text-[12px] font-semibold transition-colors",
        "bg-opt-bg-sunk text-opt-ink hover:brightness-95",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {redirecting && (
        <span
          aria-hidden
          className="h-3 w-3 animate-spin rounded-full border-2 border-opt-ink-3 border-t-opt-ink"
        />
      )}
      {redirecting ? "Redirecting…" : "Connect Deriv"}
    </button>
  );
}

function detailOf(e: unknown): string | null {
  return (
    (e as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? null
  );
}
