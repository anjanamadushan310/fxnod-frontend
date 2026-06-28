"use client";

import { cn } from "@/lib/cn";

/** Multiplier options (Deriv §6.3). */
const MULTIPLIERS = [40, 100, 200, 300, 400];

interface MultiplierPickerProps {
  value: number;
  onSelect: (n: number) => void;
}

/** Floating multiplier list (selected = near-black fill). */
export function MultiplierPicker({ value, onSelect }: MultiplierPickerProps) {
  return (
    <div className="w-[176px] overflow-hidden rounded-xl border border-opt-line bg-opt-bg-elev p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-1">
        {MULTIPLIERS.map((n) => {
          const selected = n === value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onSelect(n)}
              className={cn(
                "rounded-md px-3 py-2 text-left text-[13px] font-semibold tabular-nums transition-colors",
                selected
                  ? "bg-opt-ink text-opt-bg"
                  : "text-opt-ink hover:bg-opt-bg-sunk",
              )}
            >
              x{n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
