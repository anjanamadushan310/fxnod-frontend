"use client";

import { cn } from "@/lib/cn";
import { CONTRACT_TYPES, type ContractTypeId } from "./contractTypes";

interface ContractTypeTabsProps {
  value: ContractTypeId;
  onChange: (id: ContractTypeId) => void;
}

/**
 * Horizontal scroll-snap of contract type pills. Active pill is solid dark.
 * The list scrolls horizontally on narrow widths — no breakpoint stacking
 * (Deriv-style).
 */
export function ContractTypeTabs({ value, onChange }: ContractTypeTabsProps) {
  return (
    <div
      className={cn(
        "flex flex-1 gap-0.5 overflow-x-auto",
        // Hide the scrollbar without losing scrollability.
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {CONTRACT_TYPES.map((type) => {
        const active = type.id === value;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={cn(
              "whitespace-nowrap rounded-full border-0 px-3.5 py-2 text-[13px] font-medium",
              "transition-colors duration-150",
              active
                ? "bg-opt-ink text-opt-bg"
                : "bg-transparent text-opt-ink-2 hover:bg-opt-bg-sunk hover:text-opt-ink",
            )}
          >
            {type.label}
            {type.trending && <span className="ml-1 text-[11px]">🔥</span>}
          </button>
        );
      })}
    </div>
  );
}
