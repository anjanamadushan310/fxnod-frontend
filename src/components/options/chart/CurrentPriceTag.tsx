"use client";

import { memo } from "react";
import { cn } from "@/lib/cn";

interface CurrentPriceTagProps {
  price: number;
  /** Position in absolute terms inside the chart svg-host. */
  topPercent: number;
  /** "rise" | "fall" | null — colours the dot but not the capsule. */
  trend?: "rise" | "fall" | null;
}

/**
 * The little black capsule that sits on the right edge of the chart at the
 * current price's Y position.
 *
 * Wrapped in React.memo because ChartCanvas re-renders on every tick — but
 * this label only needs to re-render when its own props change.
 */
function CurrentPriceTagInner({
  price,
  topPercent,
  trend = null,
}: CurrentPriceTagProps) {
  return (
    <div
      className="pointer-events-none absolute right-0 -translate-y-1/2"
      style={{ top: `${topPercent}%` }}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-semibold leading-none",
          "bg-opt-ink text-opt-bg font-mono tabular-nums",
          "shadow-sm",
        )}
      >
        {trend && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              trend === "rise" ? "bg-opt-rise" : "bg-opt-fall",
            )}
          />
        )}
        {price.toFixed(2)}
      </div>
    </div>
  );
}

export const CurrentPriceTag = memo(CurrentPriceTagInner);
