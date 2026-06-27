"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { ConnectDerivButton } from "../deriv/ConnectDerivButton";

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
            Welcome to FXNod
          </h2>
          <p className="text-[13px] leading-relaxed text-opt-ink-3">
            Connect your Deriv account to fund your balance, place trades, and
            track your positions in real time.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <ConnectDerivButton />
          <p className="text-center text-[11px] leading-relaxed text-opt-ink-4">
            You’ll be redirected to Deriv to authorise the connection. We never
            see your Deriv password.
          </p>
        </div>
      </div>
    </div>
  );
}
