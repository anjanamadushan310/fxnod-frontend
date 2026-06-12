"use client";

import { useState } from "react";
import { CaretDownIcon, CaretUpIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

interface StatsStripProps {
  /**
   * Recent run-lengths (Deriv "Accumulators" stat — how many consecutive ticks
   * the price stayed in the no-touch barrier). First entry is the current /
   * latest run.
   */
  runs?: number[];
}

/**
 * The "Stats" strip that lives between the chart and the GMT footer when
 * the Accumulators contract type is active.
 *
 * Owns a tiny local state for the collapsed flag — the chart isn't affected
 * by it, so the chart canvas doesn't re-render when you toggle visibility.
 */
export function StatsStrip({
  runs = [100, 4, 17, 35, 81, 219, 38, 7, 50, 13],
}: StatsStripProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex items-center gap-3.5 px-4 py-2 text-[12px]">
      <span
        className={cn(
          "font-semibold text-opt-ink-2",
          "underline decoration-opt-ink-3/60 underline-offset-[4px]",
        )}
      >
        Stats
      </span>

      {open && (
        <div className="flex flex-1 gap-[18px] overflow-x-auto font-mono text-opt-ink-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {runs.map((n, i) => (
            <span
              key={i}
              className={cn(
                "font-medium tabular-nums",
                i === 0 &&
                  "font-bold text-opt-ink border-b-2 border-opt-ink pb-[1px]",
              )}
            >
              {n}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "Hide stats" : "Show stats"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "grid h-6 w-6 place-items-center rounded-md border-0 bg-transparent text-opt-ink-3",
          "ml-auto hover:bg-opt-bg-sunk hover:text-opt-ink",
        )}
      >
        {open ? (
          <CaretUpIcon className="h-3.5 w-3.5" />
        ) : (
          <CaretDownIcon className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
