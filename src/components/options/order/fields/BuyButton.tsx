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
}

/**
 * The big CTA at the bottom of the order panel.
 *
 * Colour is keyed by `side` so this single component covers every contract:
 *   - rise/up   → opt-rise green
 *   - fall/down → opt-fall red
 *   - neutral   → opt-rise (default Buy)
 *
 * Subscribe to the live payout up at the panel level and pass it down via
 * `payoutLabel`. The button itself owns no live data.
 */
export function BuyButton({
  side = "neutral",
  disabled,
  payoutLabel,
  onClick,
  label = "Buy",
}: BuyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full flex-col items-center gap-0.5 rounded-[10px] border-0 px-4 py-3 text-white",
        "text-[14px] font-semibold transition-[filter] duration-150",
        "hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed",
        side === "fall" ? "bg-opt-fall" : "bg-opt-rise",
      )}
    >
      <span>{label}</span>
      {payoutLabel && (
        <span className="font-mono text-[11px] font-medium text-white/90 tabular-nums">
          {payoutLabel}
        </span>
      )}
    </button>
  );
}
