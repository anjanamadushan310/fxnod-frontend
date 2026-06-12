"use client";

import type { ReactNode } from "react";
import { useTicking } from "@/hooks/useTicking";
import { cn } from "@/lib/cn";

export interface Market {
  key: string;
  label: string;
  symbol: string;
  base: number;
  /** `alt` swaps to the navy-filled ring variant (Crypto / Indices / Stocks in the design). */
  alt: boolean;
  glyph: ReactNode;
}

interface MarketTileProps {
  market: Market;
  ticking?: boolean;
  onClick?: () => void;
}

export function MarketTile({ market, ticking = true, onClick }: MarketTileProps) {
  const { value } = useTicking(
    market.base,
    ticking,
    1600 + ((market.base * 13) % 1200),
  );
  const change = ((value - market.base) / market.base) * 100;
  const up = change >= 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2.5 rounded-xl border-0 bg-transparent p-2",
        "transition-[background,transform] duration-150",
        "hover:-translate-y-0.5 hover:bg-surface-2",
      )}
    >
      <div
        className={cn(
          "relative grid h-[72px] w-[72px] place-items-center rounded-full",
          "max-lg:h-16 max-lg:w-16",
          market.alt
            ? "bg-[linear-gradient(180deg,var(--navy),var(--navy-3))] text-gold shadow-[inset_0_0_0_2.5px_var(--gold),0_0_0_4px_rgba(201,162,78,0.15),0_8px_18px_-10px_rgba(10,20,48,0.5)]"
            : "bg-surface text-ink shadow-[inset_0_0_0_2.5px_var(--gold),0_1px_2px_rgba(0,0,0,0.04),0_8px_18px_-10px_rgba(201,162,78,0.4)]",
        )}
      >
        {market.glyph}
      </div>

      <div className="text-[13px] font-semibold text-ink">{market.label}</div>

      <div className="font-mono text-[10px] tabular-nums text-ink-3">
        <span>{market.symbol}</span>{" "}
        <b
          className={cn(
            "font-semibold",
            up
              ? "text-[#1f7a3f] dark:text-[#9be0a8]"
              : "text-[#a04545] dark:text-[#f0a0a0]",
          )}
        >
          {up ? "+" : ""}
          {change.toFixed(2)}%
        </b>
      </div>
    </button>
  );
}
