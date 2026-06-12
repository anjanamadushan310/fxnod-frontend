"use client";

import { cn } from "@/lib/cn";

interface SummaryRowProps {
  label: string;
  value: string;
  /** Trim the dotted underline on the label (used for non-clickable labels). */
  plain?: boolean;
}

/**
 * Single read-only key/value row used in order panel summaries:
 *
 *   Max. payout                     6,000.00 USD
 *   Barrier                          ± 0.03797%
 *   Stop out                         10.00 USD
 *   Commission                        1.46 USD
 *
 * The label gets a dotted underline by default to mark it as a "more info"
 * hover target — that drawer comes later. Pass `plain` to drop it.
 */
export function SummaryRow({ label, value, plain }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between text-[12.5px] text-opt-ink-2">
      <span
        className={cn(
          "font-medium",
          !plain &&
            "underline decoration-opt-ink-3/60 decoration-dotted underline-offset-2",
        )}
      >
        {label}
      </span>
      <b className="font-mono font-bold tabular-nums text-opt-ink">{value}</b>
    </div>
  );
}
