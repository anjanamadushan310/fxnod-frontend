"use client";

import { useState } from "react";
import {
  BarsIcon,
  ChevronIcon,
  CryptoIcon,
  IndicesIcon,
  OptionsIcon,
  StarIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import {
  CATEGORIES,
  type MarketCategoryId,
  type MarketSubCategoryId,
} from "./catalog";

interface MarketCategoryRailProps {
  activeCategoryId: MarketCategoryId;
  activeSubCategoryId?: MarketSubCategoryId;
  onSelect: (id: MarketCategoryId, sub?: MarketSubCategoryId) => void;
}

const ICONS: Record<MarketCategoryId, React.ReactNode> = {
  favorites: <StarIcon className="h-[18px] w-[18px]" />,
  stock_indices: <IndicesIcon className="h-[18px] w-[18px]" />,
  derived: <OptionsIcon className="h-[18px] w-[18px]" />,
  cryptocurrencies: <CryptoIcon className="h-[18px] w-[18px]" />,
  forex: <BarsIcon className="h-[18px] w-[18px]" />,
  commodities: <BarsIcon className="h-[18px] w-[18px]" />,
};

/**
 * Left rail of the MarketPicker. Self-contained:
 *  - Top-level categories
 *  - Some categories expand to show sub-categories (e.g. Derived → Baskets / Synthetics)
 *  - Active row + active sub-row visual states
 *
 * State for which sections are *expanded* is local to this component — the
 * parent only knows about the active category/sub.
 */
export function MarketCategoryRail({
  activeCategoryId,
  activeSubCategoryId,
  onSelect,
}: MarketCategoryRailProps) {
  const [openIds, setOpenIds] = useState<Set<MarketCategoryId>>(
    () => new Set(["derived"]),
  );

  const toggle = (id: MarketCategoryId) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto border-r border-opt-line bg-opt-bg-sunk p-2">
      <div className="px-2 py-1 text-[15px] font-semibold text-opt-ink">
        Markets
      </div>

      {CATEGORIES.map((cat) => {
        const isActive = cat.id === activeCategoryId && !activeSubCategoryId;
        const hasSubs = (cat.subCategories?.length ?? 0) > 0;
        const isOpen = openIds.has(cat.id);
        return (
          <div key={cat.id}>
            <button
              type="button"
              data-active={isActive}
              onClick={() => {
                if (hasSubs) toggle(cat.id);
                onSelect(cat.id);
              }}
              className={cn(
                "relative flex w-full items-center gap-2.5 rounded-lg border-0 bg-transparent px-2.5 py-2 text-left text-[13px] font-medium text-opt-ink-2",
                "transition-colors hover:bg-black/[0.04] hover:text-opt-ink",
                "dark:hover:bg-white/[0.04]",
                isActive &&
                  "bg-opt-bg-elev text-opt-ink shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_var(--opt-line)]",
              )}
            >
              {/* §5: active category gets a red left-border indicator. */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[#FF4444]"
                />
              )}
              <span
                className={cn(
                  "h-[18px] w-[18px] flex-shrink-0",
                  isActive ? "text-opt-ink" : "text-opt-ink-3",
                )}
              >
                {ICONS[cat.id]}
              </span>
              <span className="flex-1">{cat.label}</span>
              {hasSubs && (
                <ChevronIcon
                  className={cn(
                    "h-3.5 w-3.5 text-opt-ink-3 transition-transform",
                    isOpen && "rotate-90",
                  )}
                />
              )}
            </button>

            {hasSubs && isOpen && (
              <div className="flex flex-col">
                {cat.subCategories!.map((sub) => {
                  const active =
                    cat.id === activeCategoryId &&
                    sub.id === activeSubCategoryId;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => onSelect(cat.id, sub.id)}
                      className={cn(
                        "relative rounded-lg border-0 bg-transparent py-1.5 pl-[38px] pr-2.5 text-left text-[12.5px] font-medium text-opt-ink-3",
                        "transition-colors hover:bg-black/[0.04] hover:text-opt-ink",
                        "dark:hover:bg-white/[0.04]",
                        active && "font-semibold text-opt-ink",
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute left-[26px] top-1/2 h-3.5 w-[3px] -translate-y-1/2 rounded-sm bg-opt-ink"
                        />
                      )}
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
