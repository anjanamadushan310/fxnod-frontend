"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFavoriteMarkets } from "@/hooks/useFavoriteMarkets";
import { cn } from "@/lib/cn";
import {
  ALL_MARKETS,
  CATEGORIES,
  type MarketCategoryId,
  type MarketGroup as TGroup,
  type MarketSubCategoryId,
} from "./catalog";
import { MarketCategoryRail } from "./MarketCategoryRail";
import { MarketGroup } from "./MarketGroup";
import { MarketSearchBox } from "./MarketSearchBox";

interface MarketPickerProps {
  activeMarketId: string;
  onSelectMarket: (id: string) => void;
  onClose: () => void;
}

/**
 * Two-pane modal-style picker. Composes:
 *   - Header: title + search
 *   - Body:   [category rail | market list]
 *
 * Closes when:
 *   - Escape pressed
 *   - User clicks outside the popover
 *   - User picks a market (the onSelectMarket caller handles it)
 *
 * Owns the search query + active rail state — both are local because they
 * shouldn't persist across opens.
 */
export function MarketPicker({
  activeMarketId,
  onSelectMarket,
  onClose,
}: MarketPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<MarketCategoryId>("derived");
  const [activeSub, setActiveSub] = useState<MarketSubCategoryId | undefined>(
    "synthetics",
  );
  const { ids: favoriteIds, toggle, isFavorite: _isFav } = useFavoriteMarkets();
  void _isFav;
  // Keystrokes stay instant; the filter pass runs once typing pauses.
  const debouncedQuery = useDebouncedValue(query, 200);

  // Outside click + Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    // Defer click handler one tick so the click that *opened* the picker
    // doesn't immediately close it.
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

  const groups = useMemo<TGroup[]>(() => {
    const q = debouncedQuery.trim().toLowerCase();

    if (q) {
      // Search mode: filter across ALL categories, grouped under category
      // headers (§5). Favorites isn't a real market category.
      return CATEGORIES.filter((c) => c.id !== "favorites")
        .map((cat) => ({
          id: cat.id,
          label: cat.label,
          marketIds: ALL_MARKETS.filter(
            (m) => m.category === cat.id && m.name.toLowerCase().includes(q),
          ).map((m) => m.id),
        }))
        .filter((g) => g.marketIds.length > 0);
    }

    if (activeCat === "favorites") {
      const ids = [...favoriteIds];
      return ids.length
        ? [{ id: "favorites", label: "Favorites", marketIds: ids }]
        : [];
    }

    const cat = CATEGORIES.find((c) => c.id === activeCat);
    if (!cat) return [];
    if (!activeSub) return cat.groups;

    // Restrict groups to ones whose markets belong to the active sub-category.
    return cat.groups
      .map((g) => ({
        ...g,
        marketIds: g.marketIds.filter((id) => {
          const m = ALL_MARKETS.find((mm) => mm.id === id);
          return m?.subCategory === activeSub;
        }),
      }))
      .filter((g) => g.marketIds.length > 0);
  }, [debouncedQuery, activeCat, activeSub, favoriteIds]);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="false"
      aria-label="Markets"
      className={cn(
        "absolute left-0 top-[calc(100%+6px)] z-30",
        "flex h-[480px] w-[660px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl",
        "border border-opt-line bg-opt-bg-elev",
        "shadow-[0_20px_50px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)]",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-opt-line px-4 py-3">
        <MarketSearchBox value={query} onChange={setQuery} />
      </div>

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-cols-[200px_1fr]">
        <MarketCategoryRail
          activeCategoryId={activeCat}
          activeSubCategoryId={activeSub}
          onSelect={(id, sub) => {
            setActiveCat(id);
            setActiveSub(sub);
            setQuery("");
          }}
        />

        <div className="overflow-y-auto px-1 pb-3 pt-1.5 [scrollbar-width:thin]">
          {groups.length === 0 ? (
            <EmptyResults query={query} />
          ) : (
            groups.map((g) => (
              <MarketGroup
                key={g.id}
                group={g}
                activeMarketId={activeMarketId}
                favoriteIds={favoriteIds}
                onSelectMarket={(id) => {
                  onSelectMarket(id);
                  onClose();
                }}
                onToggleFavorite={toggle}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyResults({ query }: { query: string }) {
  return (
    <div className="px-5 py-10 text-center text-[13px] text-opt-ink-3">
      {query
        ? `No markets match “${query}”`
        : "No markets in this category yet"}
    </div>
  );
}
