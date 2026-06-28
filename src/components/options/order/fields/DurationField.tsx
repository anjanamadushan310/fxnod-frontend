"use client";

import { useRef, useState } from "react";
import { CaretDownIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { AnchoredPopover } from "./AnchoredPopover";
import { DurationPicker } from "./DurationPicker";
import { Field } from "./Field";

export type DurationUnit = "ticks" | "s" | "min" | "h" | "d";

export interface DurationValue {
  amount: number;
  unit: DurationUnit;
}

interface DurationFieldProps {
  value: DurationValue;
  onChange?: (v: DurationValue) => void;
}

/**
 * Duration field — shows the chosen duration and opens a floating
 * {@link DurationPicker} on click (Deriv §6.1). The field takes the teal
 * focus highlight while its picker is open.
 */
export function DurationField({ value, onChange }: DurationFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Field label="Duration" active={open}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex flex-1 items-center justify-between gap-2 bg-transparent text-left",
        )}
      >
        <span className="font-mono text-[14px] font-semibold tabular-nums text-opt-ink">
          {formatDuration(value)}
        </span>
        <CaretDownIcon className="h-3.5 w-3.5 text-opt-ink-3" />
      </button>

      {open && (
        <AnchoredPopover anchorRef={triggerRef} onClose={() => setOpen(false)}>
          <DurationPicker
            value={value}
            onSelect={(v) => {
              onChange?.(v);
              setOpen(false);
            }}
          />
        </AnchoredPopover>
      )}
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

/**
 * Trivial duration state hook. Defaults to "5 min" but accepts a per-type
 * initial value — Rise/Fall passes "5 ticks" per the spec's duration-default
 * table (§13).
 */
export function useDefaultDuration(
  initial: DurationValue = { amount: 5, unit: "min" },
): [DurationValue, (v: DurationValue) => void] {
  const [v, setV] = useState<DurationValue>(initial);
  return [v, setV];
}
