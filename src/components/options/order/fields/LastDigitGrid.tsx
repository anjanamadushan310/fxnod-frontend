"use client";

import { cn } from "@/lib/cn";
import { Field } from "./Field";

interface LastDigitGridProps {
  /** Selected digit 0–9. */
  value: number;
  onChange: (digit: number) => void;
  /** Live frequency per digit (length 10). */
  percentages: number[];
  /** Digits that can't be picked (Over/Under §6.9 — 9 for Over, 0 for Under). */
  disabledDigits?: number[];
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * "Last digit prediction" selector for Matches/Differs & Over/Under. A 0–9
 * grid; the chosen digit is filled dark, each cell shows its live frequency
 * below. Over/Under gray out one unreachable digit.
 *
 * The lowest-frequency (enabled) digit's percentage is tinted to hint at the
 * longest-odds pick (matches the Deriv reference).
 */
export function LastDigitGrid({
  value,
  onChange,
  percentages,
  disabledDigits = [],
}: LastDigitGridProps) {
  const min = Math.min(
    ...DIGITS.filter((d) => !disabledDigits.includes(d)).map(
      (d) => percentages[d] ?? Infinity,
    ),
  );

  return (
    <Field label="Last digit prediction">
      <div className="grid w-full grid-cols-5 gap-x-2 gap-y-2.5 pt-1">
        {DIGITS.map((d) => {
          const disabled = disabledDigits.includes(d);
          const selected = d === value && !disabled;
          const pct = percentages[d] ?? 0;
          const isMin = !disabled && pct === min;
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onChange(d)}
              className={cn(
                "flex flex-col items-center gap-1",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg text-[15px] font-semibold tabular-nums",
                  "transition-colors duration-150",
                  selected
                    ? "bg-opt-ink text-opt-bg"
                    : disabled
                      ? "text-opt-ink-3"
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
