"use client";

import { cn } from "@/lib/cn";
import type { Market } from "./catalog";
import { FavStar } from "./FavStar";

interface MarketRowProps {
  market: Market;
  active: boolean;
  isFavorite: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

/**
 * One row in the picker's right pane.
 *
 * Active row gets a 2-pixel bookmark on its left edge — matches the Vela
 * design. Star is its own focusable button so the keyboard user can
 * favorite without first selecting.
 */
export function MarketRow({
  market,
  active,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: MarketRowProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => onSelect(market.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-2.5 py-2 text-left",
        "transition-colors hover:bg-opt-bg-sunk",
        active && "bg-opt-bg-sunk shadow-[inset_2px_0_0_var(--opt-ink)]",
      )}
    >
      <MiniInstrumentBadge name={market.name} />
      <span
        className={cn(
          "flex-1 truncate text-[13.5px] font-medium",
          active ? "text-opt-ink" : "text-opt-ink-2",
        )}
      >
        {market.name}
      </span>
      <FavStar on={isFavorite} onToggle={() => onToggleFavorite(market.id)} />
    </button>
  );
}

/**
 * Tiny 32x32 instrument tile — first letter on navy, gold accent. Keeps the
 * row visually anchored without requiring per-instrument iconography.
 */
function MiniInstrumentBadge({ name }: { name: string }) {
  const initial = name.slice(0, 1).toUpperCase();
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-opt-bg-sunk">
      <svg viewBox="0 0 32 32" className="h-7 w-7">
        <rect x="2" y="2" width="28" height="28" rx="5" fill="#0d1633" />
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fill="#c9a24e"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
          fontSize="11"
        >
          {initial}
        </text>
      </svg>
    </div>
  );
}
