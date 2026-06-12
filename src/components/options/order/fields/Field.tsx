"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  /** Tiny hint text on the right of the label row (e.g. "min 1 · max 2,000"). */
  hint?: ReactNode;
  /** Right-side trailing slot — usually a switch, info dot or steppers. */
  trailing?: ReactNode;
  /** The bottom row content — usually an input or pills row. */
  children: ReactNode;
  /** Make the field appear disabled / read-only. */
  disabled?: boolean;
}

/**
 * Bordered "card" used by every order ticket input. Two rows inside:
 *
 *   ┌────────────────────────────────────┐
 *   │ label         hint     [trailing]  │
 *   │ {children — input / pills / etc.}  │
 *   └────────────────────────────────────┘
 *
 * Layout shell only — no input logic. Each concrete field (Stake, Duration,
 * TakeProfit …) wraps this and supplies its own children + trailing.
 */
export function Field({
  label,
  hint,
  trailing,
  children,
  disabled,
}: FieldProps) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-opt-line bg-opt-bg-elev px-3 py-2.5",
        "transition-colors hover:border-opt-line-strong",
        "focus-within:border-opt-ink",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-opt-ink-3">{label}</span>
        {hint && (
          <span className="text-[11px] font-medium text-opt-ink-3">{hint}</span>
        )}
        {trailing && <span className="ml-auto flex items-center">{trailing}</span>}
      </div>
      <div className="mt-0.5 flex items-center gap-1.5">{children}</div>
    </div>
  );
}
