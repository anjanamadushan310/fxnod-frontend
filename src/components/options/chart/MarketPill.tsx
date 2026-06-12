"use client";

import { CaretDownIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

interface MarketPillProps {
  /** Display name e.g. "Volatility 100 (1s) Index". */
  name: string;
  /** Latest price. */
  price: number;
  /** Absolute change since anchor. */
  change: number;
  /** Percent change since anchor. */
  changePct: number;
  /** Open the market picker dropdown. */
  onOpen?: () => void;
}

/**
 * The clickable instrument badge at the top-left of the chart column.
 *
 * Subscribes to nothing — receives the latest tick via props. ChartPanel
 * is the single owner of the price hook; this component only re-renders
 * when its specific props change.
 */
export function MarketPill({
  name,
  price,
  change,
  changePct,
  onOpen,
}: MarketPillProps) {
  const up = change >= 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex min-w-[280px] items-center gap-3 rounded-[10px] border border-opt-line bg-opt-bg-elev",
        "px-3.5 py-2.5",
        "transition-colors hover:border-opt-line-strong",
      )}
    >
      <InstrumentBadge />

      <div className="flex flex-col items-start">
        <div className="text-[13.5px] font-semibold leading-tight text-opt-ink">
          {name}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] leading-tight text-opt-ink-3">
          <span className="font-mono tabular-nums">{price.toFixed(2)}</span>
          <span
            className={cn(
              "font-mono tabular-nums",
              up ? "text-opt-rise" : "text-opt-fall",
            )}
          >
            {up ? "+" : ""}
            {change.toFixed(2)} ({up ? "+" : ""}
            {changePct.toFixed(2)}%) {up ? "▲" : "▼"}
          </span>
        </div>
      </div>

      <CaretDownIcon className="ml-auto h-3.5 w-3.5 text-opt-ink-3" />
    </button>
  );
}

/**
 * The tiny 36x36 instrument tile shown to the left of the name. For
 * "Volatility 100 (1s) Index" we render a stylised candle motif — replace
 * later with per-instrument iconography from the markets catalogue.
 */
function InstrumentBadge() {
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-opt-bg-sunk">
      <svg viewBox="0 0 36 36" className="h-7 w-7">
        {/* "100 1s" mini badge */}
        <rect x="3" y="3" width="30" height="30" rx="6" fill="#0d1633" />
        <text
          x="10"
          y="14"
          fill="#fff"
          fontSize="6"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
        >
          100
        </text>
        <text
          x="22"
          y="14"
          fill="#c9a24e"
          fontSize="6"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
        >
          1s
        </text>
        {/* mini candles */}
        <rect x="9" y="20" width="2" height="6" fill="#3fb568" />
        <rect x="14" y="18" width="2" height="9" fill="#3fb568" />
        <rect x="19" y="22" width="2" height="6" fill="#d56262" />
        <rect x="24" y="17" width="2" height="10" fill="#3fb568" />
      </svg>
    </div>
  );
}
