"use client";

import { useDerivStatus } from "@/hooks/useDerivStatus";
import { useStartDerivOAuth } from "@/hooks/useStartDerivOAuth";
import { cn } from "@/lib/cn";

/**
 * Top-bar control for Deriv account linking (authenticated users).
 *
 *  - Reads link status via the Orval-generated `derivAccountStatus` query
 *    (→ GET /api/v1/deriv/account/status through the shared axios instance).
 *  - When unlinked, starts the OAuth flow via `useStartDerivOAuth` (shared with
 *    the login modal's "Continue with Deriv" button).
 */
export function ConnectDerivButton() {
  const { linked, accountId, isLoading } = useDerivStatus();
  const { start, redirecting } = useStartDerivOAuth();

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
      onClick={start}
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
