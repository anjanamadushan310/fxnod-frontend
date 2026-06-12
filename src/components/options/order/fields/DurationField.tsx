"use client";

import { useState } from "react";
import { CaretDownIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { Field } from "./Field";

export type DurationUnit = "ticks" | "s" | "min" | "h" | "d";

export interface DurationValue {
  amount: number;
  unit: DurationUnit;
}

interface DurationFieldProps {
  value: DurationValue;
  onChange?: (v: DurationValue) => void;
  /** Clicking opens a picker; V1 just exposes a callback. */
  onOpen?: () => void;
}

/**
 * Display-only field showing the chosen duration. Clicking it should pop a
 * unit/amount picker (Phase E). For Phase C we render it as a passive
 * looking input.
 */
export function DurationField({ value, onOpen }: DurationFieldProps) {
  return (
    <Field label="Duration">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex flex-1 items-center justify-between gap-2 bg-transparent text-left",
        )}
      >
        <span className="font-mono text-[14px] font-semibold tabular-nums text-opt-ink">
          {formatDuration(value)}
        </span>
        <CaretDownIcon className="h-3.5 w-3.5 text-opt-ink-3" />
      </button>
    </Field>
  );
}

export function formatDuration({ amount, unit }: DurationValue): string {
  const labels: Record<DurationUnit, [string, string]> = {
    ticks: ["tick", "ticks"],
    s: ["sec", "secs"],
    min: ["min", "mins"],
    h: ["hour", "hours"],
    d: ["day", "days"],
  };
  const [singular, plural] = labels[unit];
  return `${amount} ${amount === 1 ? singular : plural}`;
}

/** Trivial hook so panels can default to "5 min" without recreating state. */
export function useDefaultDuration(): [DurationValue, (v: DurationValue) => void] {
  const [v, setV] = useState<DurationValue>({ amount: 5, unit: "min" });
  return [v, setV];
}
