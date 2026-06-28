"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AreaChartIcon, CandleChartIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import {
  CHART_TYPES,
  INTERVALS,
  type ChartTypeId,
  type IntervalId,
} from "./chartSettings";

const TEAL = "#00A79E";

interface ChartTypesModalProps {
  chartType: ChartTypeId;
  interval: IntervalId;
  /** When true (digit trade types), only "1 tick" is enabled (§4.2.2). */
  tickOnly: boolean;
  onSelectChartType: (id: ChartTypeId) => void;
  onSelectInterval: (id: IntervalId) => void;
  onClose: () => void;
}

/**
 * "Chart types" + "Time interval" centered modal (Deriv §4.2). Triggered by
 * the "1T" toolbar icon. Chart-type tiles are radio-style (teal border on the
 * active one); the interval grid shows the active option with a black border
 * and greys out trade-type-restricted options. The "Smooth chart movement"
 * toggle is local UI state (chart perf wiring comes later).
 */
export function ChartTypesModal({
  chartType,
  interval,
  tickOnly,
  onSelectChartType,
  onSelectInterval,
  onClose,
}: ChartTypesModalProps) {
  const [smooth, setSmooth] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Chart types"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-[min(460px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-opt-line bg-opt-bg-elev shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-opt-line px-5 py-4">
          <h2 className="text-[16px] font-bold text-opt-ink">Chart types</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-opt-ink-3 transition-colors hover:bg-opt-bg-sunk hover:text-opt-ink"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Section 1 — Chart types */}
          <div className="grid grid-cols-4 gap-2.5">
            {CHART_TYPES.map((type) => {
              const active = chartType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => onSelectChartType(type.id)}
                  aria-pressed={active}
                  style={
                    active
                      ? {
                          borderColor: TEAL,
                          backgroundColor: "rgba(0,167,158,0.10)",
                          color: TEAL,
                        }
                      : undefined
                  }
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-colors",
                    !active &&
                      "border-opt-line text-opt-ink-4 hover:border-opt-line-strong hover:text-opt-ink-2",
                  )}
                >
                  <ChartTypeGlyph id={type.id} />
                  <span className="text-[12px] font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 2 — Time interval */}
          <div className="grid grid-cols-4 gap-2">
            {INTERVALS.map((opt) => {
              const active = interval === opt.id;
              const disabled = tickOnly && opt.id !== "1t";
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && onSelectInterval(opt.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-lg border px-1.5 py-2 text-[12px] font-medium transition-colors",
                    disabled
                      ? "cursor-not-allowed border-opt-line bg-opt-bg-sunk text-opt-ink-4 opacity-50"
                      : active
                        ? "border-opt-ink text-opt-ink"
                        : "border-opt-line text-opt-ink-2 hover:border-opt-line-strong hover:text-opt-ink",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Section 3 — Smooth chart movement toggle */}
          <div className="flex items-center justify-between gap-3 border-t border-opt-line pt-4">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-opt-ink">
                Smooth chart movement
              </span>
              <span className="text-[11px] leading-snug text-opt-ink-3">
                Performance may vary by device. Turn off if it lags.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={smooth}
              aria-label="Smooth chart movement"
              onClick={() => setSmooth((v) => !v)}
              style={smooth ? { backgroundColor: TEAL } : undefined}
              className={cn(
                "relative h-[22px] w-[40px] flex-shrink-0 rounded-full transition-colors",
                !smooth && "bg-opt-line-strong",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-[2px] top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform",
                  smooth && "translate-x-[18px]",
                )}
              />
            </button>
          </div>
        </div>

        {/* Footer notice */}
        <div className="bg-opt-bg-sunk px-5 py-3 text-[11px] leading-snug text-opt-ink-3">
          Only selected charts and time intervals are available for this trade
          type.
        </div>
      </div>
    </div>
  );
}

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
