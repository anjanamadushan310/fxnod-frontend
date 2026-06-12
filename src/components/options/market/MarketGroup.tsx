"use client";

import { findMarket, type MarketGroup as TGroup } from "./catalog";
import { MarketRow } from "./MarketRow";

interface MarketGroupProps {
  group: TGroup;
  activeMarketId: string;
  favoriteIds: Set<string>;
  onSelectMarket: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

/**
 * Section header + a list of MarketRow. Pure rendering; ignores any rows
 * whose ID has been removed from the catalog (defensive — the catalog and
 * a stored favorite can drift after a deploy).
 */
export function MarketGroup({
  group,
  activeMarketId,
  favoriteIds,
  onSelectMarket,
  onToggleFavorite,
}: MarketGroupProps) {
  const rows = group.marketIds
    .map(findMarket)
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  if (rows.length === 0) return null;

  return (
    <div className="px-2 pb-1 pt-2.5">
      <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-opt-ink-3">
        {group.label}
      </div>
      <div className="flex flex-col" role="listbox" aria-label={group.label}>
        {rows.map((market) => (
          <MarketRow
            key={market.id}
            market={market}
            active={market.id === activeMarketId}
            isFavorite={favoriteIds.has(market.id)}
            onSelect={onSelectMarket}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
