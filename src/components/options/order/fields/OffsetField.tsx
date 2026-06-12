"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Field } from "./Field";
import { InfoDot } from "./InfoDot";

interface OffsetFieldProps {
  label: string;
  /** Signed offset from spot (e.g. +0.41 barrier, +0.00 strike). */
  value: number;
  onChange: (next: number) => void;
  withInfo?: boolean;
  infoLabel?: string;
  decimals?: number;
}

/**
 * Signed numeric offset input — shared by "Strike price" (Vanillas) and
 * "Barrier" (Higher/Lower, Touch/No Touch). Displays a leading `+` for
 * non-negative values, Deriv-style.
 *
 * Keeps its own text state so partial edits ("+", "-", "1.") don't fight the
 * formatter; normalizes the display on blur.
 */
export function OffsetField({
  label,
  value,
  onChange,
  withInfo = false,
  infoLabel,
  decimals = 2,
}: OffsetFieldProps) {
  const fmt = (n: number) =>
    (n >= 0 ? "+" : "") + n.toFixed(decimals);

  const [text, setText] = useState(() => fmt(value));

  return (
    <Field
      label={label}
      trailing={withInfo ? <InfoDot label={infoLabel ?? label} /> : undefined}
    >
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(n);
        }}
        onBlur={() => setText(fmt(value))}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-semibold tabular-nums text-opt-ink",
          "outline-none placeholder:text-opt-ink-4",
        )}
      />
    </Field>
  );
}
