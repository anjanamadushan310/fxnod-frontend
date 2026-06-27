"use client";

import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDerivLink } from "@/services/api/endpoints/trading/trading";
import { derivStatusKey } from "@/hooks/useDerivStatus";
import {
  derivApi,
  parseDerivCallback,
  type DerivAccount,
} from "@/services/tradingApi";
import { useAuthStore } from "@/stores/authStore";

/** sessionStorage key written by whoever calls derivApi.authorize() before redirect. */
export const DERIV_STATE_KEY = "deriv_link_state";
/** sessionStorage key holding the in-app path to return to after linking. */
export const DERIV_RETURN_TO_KEY = "deriv_return_to";
/**
 * sessionStorage key recording why the OAuth flow was started, captured
 * deterministically at click time (not re-derived in the callback, which would
 * race the auth bootstrap):
 *   "login" — logged-out visitor; Deriv mints an FXNod session
 *   "link"  — already-authenticated user linking/switching a trading account
 */
export const DERIV_INTENT_KEY = "deriv_oauth_intent";

type Phase =
  | { name: "loading" }
  | { name: "error"; message: string }
  | {
      name: "pick";
      accounts: DerivAccount[];
      /** ID of the currently linked account, if any — shown as a warning. */
      currentAccountId: string | undefined;
    }
  | { name: "linking" }
  | { name: "done"; accountId: string };

export function CallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const linkMutation = useDerivLink();
  const loginWithDeriv = useAuthStore((s) => s.loginWithDeriv);
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  // Capture state once on mount — don't re-read on every render.
  const oauthStateRef = useRef<string | null>(null);

  useEffect(() => {
    oauthStateRef.current = sessionStorage.getItem(DERIV_STATE_KEY);

    if (!oauthStateRef.current) {
      setPhase({
        name: "error",
        message:
          "OAuth session expired or not found. Please start the account linking process again.",
      });
      return;
    }

    const accounts = parseDerivCallback(searchParams.toString());
    if (accounts.length === 0) {
      setPhase({
        name: "error",
        message:
          "Deriv did not return any accounts. This can happen if you cancelled the authorisation — please try again.",
      });
      return;
    }

    // Check whether the user already has a linked account.
    derivApi
      .status()
      .then((status) => {
        setPhase({
          name: "pick",
          accounts,
          currentAccountId: status.linked ? status.deriv_account_id : undefined,
        });
      })
      .catch(() => {
        // Status check is best-effort — proceed without existing account info.
        setPhase({ name: "pick", accounts, currentAccountId: undefined });
      });
  }, [searchParams]);

  async function handleSelect(account: DerivAccount) {
    const state = oauthStateRef.current;
    if (!state) {
      setPhase({ name: "error", message: "OAuth state missing. Please try again." });
      return;
    }
    setPhase({ name: "linking" });
    try {
      const payload = {
        state,
        token: account.token,
        deriv_account_id: account.account,
        currency: account.currency,
        is_virtual: account.isVirtual,
      };

      if (sessionStorage.getItem(DERIV_INTENT_KEY) === "link") {
        // Already authenticated → link/switch the trading account.
        await linkMutation.mutateAsync({ data: payload });
      } else {
        // Logged-out → Deriv OAuth IS the login: mint the FXNod session and
        // flip the auth store to authenticated (sets the httpOnly cookie).
        await loginWithDeriv(payload);
      }

      sessionStorage.removeItem(DERIV_STATE_KEY);
      sessionStorage.removeItem(DERIV_INTENT_KEY);
      // Return the user to wherever they started the flow (default /options).
      const returnTo = safeReturnPath(sessionStorage.getItem(DERIV_RETURN_TO_KEY));
      sessionStorage.removeItem(DERIV_RETURN_TO_KEY);
      // Refresh the shared link-status cache so the TopBar control + the order
      // panels' trade gate flip to "linked" immediately.
      await queryClient.invalidateQueries({ queryKey: derivStatusKey });
      setPhase({ name: "done", accountId: account.account });
      setTimeout(() => router.push(returnTo), 1800);
    } catch (e) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setPhase({
        name: "error",
        message: detail ?? "Failed to link account. Please try again.",
      });
    }
  }

  if (phase.name === "loading" || phase.name === "linking") {
    return (
      <PageShell>
        <LoadingCard label={phase.name === "linking" ? "Linking account…" : "Loading…"} />
      </PageShell>
    );
  }

  if (phase.name === "done") {
    return (
      <PageShell>
        <SuccessCard accountId={phase.accountId} />
      </PageShell>
    );
  }

  if (phase.name === "error") {
    return (
      <PageShell>
        <ErrorCard message={phase.message} />
      </PageShell>
    );
  }

  // pick phase
  return (
    <PageShell>
      <PickerCard
        accounts={phase.accounts}
        currentAccountId={phase.currentAccountId}
        onSelect={handleSelect}
      />
    </PageShell>
  );
}

/**
 * Guard against open redirects and loops: only allow same-origin in-app paths,
 * and never bounce back to the callback page itself.
 */
function safeReturnPath(raw: string | null): Route {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/options" as Route;
  if (raw.startsWith("/deriv/callback")) return "/options" as Route;
  return raw as Route;
}

// ─── Layout shell ────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

// ─── Cards ───────────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface shadow-card p-6 flex flex-col gap-5">
      {children}
    </div>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-gold flex-shrink-0" />
        <span className="text-[14px] font-medium text-ink-2">{label}</span>
      </div>
    </Card>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <h1 className="text-[17px] font-bold text-ink">Something went wrong</h1>
        <p className="text-[13px] leading-relaxed text-ink-3">{message}</p>
        <a
          href="/options"
          className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold-3 hover:text-gold transition-colors"
        >
          ← Back to trading
        </a>
      </div>
    </Card>
  );
}

function SuccessCard({ accountId }: { accountId: string }) {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5ec] text-[#2d7a46] text-[16px] font-bold">
            ✓
          </span>
          <h1 className="text-[17px] font-bold text-ink">Account linked</h1>
        </div>
        <p className="text-[13px] text-ink-3">
          <span className="font-mono font-semibold text-ink">{accountId}</span> is now your
          active trading account. Redirecting…
        </p>
      </div>
    </Card>
  );
}

function PickerCard({
  accounts,
  currentAccountId,
  onSelect,
}: {
  accounts: DerivAccount[];
  currentAccountId: string | undefined;
  onSelect: (account: DerivAccount) => void;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-1">
        <h1 className="text-[18px] font-bold text-ink">Connect Deriv account</h1>
        <p className="text-[13px] text-ink-3">
          Select the account you want to use for trading.
        </p>
      </div>

      {currentAccountId && (
        <div className="rounded-lg border border-[var(--gold-soft)] bg-gold-soft px-3.5 py-2.5 text-[12px] leading-relaxed text-[var(--ink-2)]">
          <span className="font-semibold text-ink">{currentAccountId}</span> is currently
          linked. Selecting a new account will replace it.
        </div>
      )}

      <ul className="flex flex-col gap-2" role="listbox" aria-label="Deriv accounts">
        {accounts.map((account) => (
          <AccountRow
            key={account.account}
            account={account}
            onSelect={onSelect}
          />
        ))}
      </ul>

      <p className="text-[11px] text-ink-3 leading-relaxed">
        Only one account can be active at a time. Demo accounts trade with virtual funds.
      </p>
    </Card>
  );
}

function AccountRow({
  account,
  onSelect,
}: {
  account: DerivAccount;
  onSelect: (account: DerivAccount) => void;
}) {
  return (
    <li role="option">
      <button
        type="button"
        onClick={() => onSelect(account)}
        className="group w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-left transition-all duration-150 hover:border-gold hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-mono text-[14px] font-semibold text-ink truncate">
              {account.account}
            </span>
            <span className="text-[12px] text-ink-3">
              {account.currency}
              {account.isVirtual ? " · Virtual funds" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {account.isVirtual ? (
              <DemoBadge />
            ) : (
              <RealBadge currency={account.currency} />
            )}
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-ink-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-gold"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </div>
        </div>
      </button>
    </li>
  );
}

function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#fef3c7] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#92400e] border border-[#fcd34d]/60">
      DEMO
    </span>
  );
}

function RealBadge({ currency }: { currency: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#e8f5ec] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#2d7a46] border border-[#86efac]/60">
      REAL · {currency}
    </span>
  );
}
