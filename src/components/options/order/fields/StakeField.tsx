"use client";

import { useRef, useState } from "react";
import { CaretDownIcon } from "@/components/ui/Icons";
import { AnchoredPopover } from "./AnchoredPopover";
import { Field } from "./Field";
import { StakePicker } from "./StakePicker";

interface StakeFieldProps {
  value: number;
  currency?: string;
  /** Min/max — shown in the hint row and enforced by the picker. */
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}

/**
 * Stake field — shows the current stake and opens a floating
 * {@link StakePicker} (quick-grid + keyboard entry) on click (Deriv §6.1).
 * Takes the teal focus highlight while its picker is open.
 *
 * NOTE: re-renders only on its own value change. ChartPanel's tick storm does
 * NOT touch this — it lives in the OrderPanel subtree.
 */
export function StakeField({
  value,
  currency = "USD",
  min,
  max,
  onChange,
}: StakeFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Deriv surfaces only the minimum on the stake field (no explicit max).
  const hint = min !== undefined ? `min ${min}` : undefined;

  return (
    <Field label="Stake" hint={hint} active={open}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex flex-1 items-center justify-between gap-2 bg-transparent text-left"
      >
        <span className="font-mono text-[14px] font-semibold tabular-nums text-opt-ink">
          {value}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-opt-ink-3">
            {currency}
          </span>
          <CaretDownIcon className="h-3.5 w-3.5 text-opt-ink-3" />
        </span>
      </button>

      {open && (
        <AnchoredPopover anchorRef={triggerRef} onClose={() => setOpen(false)}>
          <StakePicker
            value={value}
            currency={currency}
            min={min}
            max={max}
            onSelect={(n) => {
              onChange(n);
              setOpen(false);
            }}
          />
        </AnchoredPopover>
      )}
    </Field>
  );
}
