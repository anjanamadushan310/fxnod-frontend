"use client";

import { StarIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

interface FavStarProps {
  on: boolean;
  onToggle: () => void;
  label?: string;
}

/**
 * Star icon toggle used in MarketRow. Filled gold when on, hollow grey
 * otherwise. The icon itself stays an outline glyph — the colour change
 * carries the state.
 */
export function FavStar({ on, onToggle, label = "Favorite" }: FavStarProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation(); // don't let the parent row's onClick fire
        onToggle();
      }}
      className={cn(
        "grid h-[26px] w-[26px] place-items-center rounded-md border-0 bg-transparent",
        "transition-[color,background,transform] duration-100",
        on
          ? "text-[#f1b400] hover:text-[#e0a400]"
          : "text-opt-ink-4 hover:bg-opt-bg-sunk hover:text-opt-ink-2",
        "active:scale-90",
      )}
    >
      <StarIcon
        className={cn("h-4 w-4")}
        style={on ? { fill: "currentColor" } : undefined}
      />
    </button>
  );
}
