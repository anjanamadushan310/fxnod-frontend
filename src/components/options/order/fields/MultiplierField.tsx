"use client";

import { useRef, useState } from "react";
import { CaretDownIcon } from "@/components/ui/Icons";
import { AnchoredPopover } from "./AnchoredPopover";
import { Field } from "./Field";
import { InfoDot } from "./InfoDot";
import { MultiplierPicker } from "./MultiplierPicker";

interface MultiplierFieldProps {
  /** Currently-selected multiplier (e.g. 400 → renders "x400"). */
  value: number;
  onChange: (next: number) => void;
}

/**
 * Multipliers ticket field — shows the chosen leverage and opens a floating
 * {@link MultiplierPicker} (x40–x400) on click (Deriv §6.3).
 */
export function MultiplierField({ value, onChange }: MultiplierFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Field
      label="Multiplier"
      active={open}
      trailing={<InfoDot label="Multiplier info" />}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex flex-1 items-center justify-between gap-2 bg-transparent text-left"
      >
        <span className="font-mono text-[14px] font-semibold tabular-nums text-opt-ink">
          x{value}
        </span>
        <CaretDownIcon className="h-3.5 w-3.5 text-opt-ink-3" />
      </button>

      {open && (
        <AnchoredPopover anchorRef={triggerRef} onClose={() => setOpen(false)}>
          <MultiplierPicker
            value={value}
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
