"use client";

import { useEffect, useRef } from "react";
import { AreaChartIcon, CandleChartIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import {
  CHART_TYPES,
  INTERVALS,
  type ChartTypeId,
  type IntervalId,
} from "./chartSettings";

interface ChartSettingsPopoverProps {
  chartType: ChartTypeId;
  interval: IntervalId;
  onSelectChartType: (id: ChartTypeId) => void;
  onSelectInterval: (id: IntervalId) => void;
  onClose: () => void;
}

/**
 * "Chart types" + "Time interval" popover (Deriv design).
 *
 * Selection is committed straight to the URL by the parent's setters — this
 * component is presentational and reads its highlight state from the
 * `chartType` / `interval` props (which themselves derive from the URL), so
 * a deep-link to `?chart_type=candle` lights up the right cell on open.
 *
 * Closes on Escape or outside click. Anchored below the tool-strip trigger.
 */
export function ChartSettingsPopover({
  chartType,
  interval,
  onSelectChartType,
  onSelectInterval,
  onClose,
}: ChartSettingsPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    // Defer the outside-click listener a tick so the click that *opened*
    // the popover doesn't immediately close it.
    const t = setTimeout(
      () => document.addEventListener("mousedown", onClick),
      0,
    );
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onClose]);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="false"
      aria-label="Chart settings"
      className={cn(
        "absolute left-[calc(100%+8px)] top-0 z-30",
        "flex w-[420px] max-w-[calc(100vw-96px)] flex-col gap-5 rounded-2xl p-5",
        "border border-opt-line bg-opt-bg-elev",
        "shadow-[0_20px_50px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)]",
      )}
    >
      {/* ── Chart types ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold text-opt-ink">Chart types</h3>
        <div className="grid grid-cols-4 gap-2">
          {CHART_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelectChartType(type.id)}
              aria-pressed={chartType === type.id}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border px-2 py-3",
                "transition-colors duration-150",
                chartType === type.id
                  ? "border-opt-ink bg-opt-bg-sunk text-opt-ink"
                  : "border-opt-line text-opt-ink-3 hover:border-opt-line-strong hover:text-opt-ink",
              )}
            >
              <ChartTypeGlyph id={type.id} />
              <span className="text-[12px] font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Time interval ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold text-opt-ink">Time interval</h3>
        <div className="grid grid-cols-4 gap-2">
          {INTERVALS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectInterval(opt.id)}
              aria-pressed={interval === opt.id}
              className={cn(
                "rounded-lg border px-2 py-2 text-[12px] font-medium",
                "transition-colors duration-150",
                interval === opt.id
                  ? "border-opt-ink bg-opt-bg-sunk text-opt-ink"
                  : "border-opt-line text-opt-ink-3 hover:border-opt-line-strong hover:text-opt-ink",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Per-chart-type glyph. Area/Candle reuse the shared icons; Hollow + OHLC
 *  are local since they only appear here. */
function ChartTypeGlyph({ id }: { id: ChartTypeId }) {
  switch (id) {
    case "area":
      return <AreaChartIcon className="h-5 w-5" />;
    case "candle":
      return <CandleChartIcon className="h-5 w-5" />;
    case "hollow":
      return <HollowGlyph />;
    case "ohlc":
      return <OhlcGlyph />;
  }
}

function HollowGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M7 4v3M7 17v3M17 4v5M17 19v1" />
      <rect x="5" y="7" width="4" height="10" rx="0.5" />
      <rect x="15" y="9" width="4" height="10" rx="0.5" />
    </svg>
  );
}

function OhlcGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M8 5v14M4 9h4M8 13h-4" />
      <path d="M16 7v12M16 10h4M12 16h4" />
    </svg>
  );
}
