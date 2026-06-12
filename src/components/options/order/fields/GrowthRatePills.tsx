"use client";

import { cn } from "@/lib/cn";
import { Field } from "./Field";
import { InfoDot } from "./InfoDot";

interface GrowthRatePillsProps {
  /** Available rates (percent values). Default: 1, 2, 3, 4, 5. */
  options?: number[];
  value: number;
  onChange: (next: number) => void;
}

/**
 * Five-pill selector used by Accumulators for the growth rate. The selected
 * pill is outlined (inset ring) rather than filled, matching the design.
 */
export function GrowthRatePills({
  options = [1, 2, 3, 4, 5],
  value,
  onChange,
}: GrowthRatePillsProps) {
  return (
    <Field
      label="Growth rate"
      trailing={<InfoDot label="Growth rate info" />}
    >
      <div className="grid w-full grid-cols-5 gap-1">
        {options.map((opt) => {
          const on = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "rounded-lg border-0 px-1.5 py-2 text-[13px] font-semibold tabular-nums",
                "transition-colors duration-150",
                on
                  ? "bg-opt-bg-elev text-opt-ink shadow-[inset_0_0_0_1px_var(--opt-ink)]"
                  : "bg-opt-bg-sunk text-opt-ink-2 hover:text-opt-ink",
              )}
            >
              {opt}%
            </button>
          );
        })}
      </div>
    </Field>
  );
}
