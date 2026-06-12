"use client";

import { cn } from "@/lib/cn";
import { Field } from "./Field";

interface LastDigitGridProps {
  /** Selected digit 0–9. */
  value: number;
  onChange: (digit: number) => void;
  /** Live frequency per digit (length 10). */
  percentages: number[];
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * "Last digit prediction" selector for Matches/Differs. A 0–9 grid; the
 * chosen digit is filled dark, each cell shows its live frequency below.
 *
 * The lowest-frequency digit's percentage is tinted to hint at the longest-
 * odds pick (matches the Deriv reference).
 */
export function LastDigitGrid({
  value,
  onChange,
  percentages,
}: LastDigitGridProps) {
  const min = Math.min(...percentages);

  return (
    <Field label="Last digit prediction">
      <div className="grid w-full grid-cols-5 gap-x-2 gap-y-2.5 pt-1">
        {DIGITS.map((d) => {
          const selected = d === value;
          const pct = percentages[d] ?? 0;
          const isMin = pct === min;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg text-[15px] font-semibold tabular-nums",
                  "transition-colors duration-150",
                  selected
                    ? "bg-opt-ink text-opt-bg"
                    : "text-opt-ink hover:bg-opt-bg-sunk",
                )}
              >
                {d}
              </span>
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  isMin ? "text-opt-fall" : "text-opt-ink-3",
                )}
              >
                {pct.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>
    </Field>
  );
}
