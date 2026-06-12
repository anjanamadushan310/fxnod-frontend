"use client";

import { SearchIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

interface MarketSearchBoxProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

/**
 * Single-line search input used in the MarketPicker header. Visually inert
 * when empty — gains focus styling and a clear button when the user types.
 */
export function MarketSearchBox({
  value,
  onChange,
  placeholder = "Search markets",
}: MarketSearchBoxProps) {
  return (
    <div
      className={cn(
        "flex h-[34px] flex-1 items-center gap-2 rounded-lg border border-opt-line bg-opt-bg-sunk px-2.5",
        "transition-colors focus-within:border-opt-ink-3 focus-within:bg-opt-bg-elev",
      )}
    >
      <SearchIcon className="h-3.5 w-3.5 flex-shrink-0 text-opt-ink-3" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] text-opt-ink outline-none placeholder:text-opt-ink-3"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className={cn(
            "grid h-[18px] w-[18px] place-items-center rounded-full bg-transparent text-[11px] text-opt-ink-3",
            "hover:bg-opt-bg-sunk hover:text-opt-ink",
          )}
        >
          ✕
        </button>
      )}
    </div>
  );
}
