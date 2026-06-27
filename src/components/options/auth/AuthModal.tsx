"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useStartDerivOAuth } from "@/hooks/useStartDerivOAuth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Lightweight centered auth/onboarding modal (hand-rolled fixed overlay —
 * shadcn/ui isn't wired up yet). Closes on backdrop click, the X button, or
 * Escape. Hosts the Deriv OAuth trigger so a logged-out visitor can link an
 * account and start trading.
 */
export function AuthModal({ open, onClose }: AuthModalProps) {
  const { start, redirecting } = useStartDerivOAuth();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Connect your account"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-opt-line bg-opt-bg-elev p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-lg text-opt-ink-3 transition-colors hover:bg-opt-bg-sunk hover:text-opt-ink"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-opt-ink text-[15px] font-bold text-opt-bg">
            DT
          </div>
          <h2 className="text-[18px] font-bold text-opt-ink">
            Log in to FXNod
          </h2>
          <p className="text-[13px] leading-relaxed text-opt-ink-3">
            FXNod uses your Deriv account to sign in. Continue with Deriv to
            fund your balance, place trades, and track positions in real time.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={start}
            disabled={redirecting}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-opt-ink px-4 py-2.5 text-[14px] font-semibold text-opt-bg transition-[filter] duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {redirecting && (
              <span
                aria-hidden
                className="h-4 w-4 animate-spin rounded-full border-2 border-opt-bg/40 border-t-opt-bg"
              />
            )}
            {redirecting ? "Redirecting to Deriv…" : "Continue with Deriv"}
          </button>
          <p className="text-center text-[11px] leading-relaxed text-opt-ink-4">
            You’ll be redirected to Deriv to authorise sign-in. We never see
            your Deriv password.
          </p>
        </div>
      </div>
    </div>
  );
}
