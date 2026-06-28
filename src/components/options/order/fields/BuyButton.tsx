"use client";

import { cn } from "@/lib/cn";

export type BuySide = "rise" | "fall" | "neutral";

interface BuyButtonProps {
  side?: BuySide;
  /** Disable when validation fails (stake out of range, no market, etc.). */
  disabled?: boolean;
  /** Sub-text under the main label, e.g. "Payout  19.25 USD". null = hide. */
  payoutLabel?: string | null;
  onClick?: () => void;
  /** Override the main label — defaults to "Buy". */
  label?: string;
  /** Show an inline spinner + force-disable while a trade is being placed. */
  loading?: boolean;
}

/**
 * The big full-width CTA at the bottom of the order panel (Deriv DTrader §7).
 *
 * Colour is keyed by `side` using the exact Deriv brand hex (Tailwind utility
 * tokens don't reach these constant brand colours):
 *   - rise/up / neutral → teal  #00A79E
 *   - fall/down         → coral #FF4444
 *
 * Spec dims: full-width, ~48px tall, ~8px radius, 16px bold "Buy", 12px payout
 * sub-text. Live payout is lifted at the panel level and passed via `payoutLabel`.
 */
export function BuyButton({
  side = "neutral",
  disabled,
  payoutLabel,
  onClick,
  label = "Buy",
  loading = false,
}: BuyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      style={{ backgroundColor: side === "fall" ? "#FF4444" : "#00A79E" }}
      className={cn(
        "flex min-h-[48px] w-full flex-col items-center justify-center gap-0.5 rounded-[8px] border-0 px-4 py-2 text-white",
        "transition-[filter] duration-150",
        "hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed",
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-[15px] font-bold leading-none">
        {loading && (
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
        )}
        {label}
      </span>
      {payoutLabel && (
        <span className="font-mono text-[12px] font-medium text-white/90 tabular-nums">
          {payoutLabel}
        </span>
      )}
    </button>
  );
}
