"use client";

import { CaretDownIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { Field } from "./Field";
import { InfoDot } from "./InfoDot";

interface MultiplierFieldProps {
  /** Currently-selected multiplier (e.g. 400 → renders "x400"). */
  value: number;
  /** Optional picker invoke. */
  onOpen?: () => void;
}

/**
 * Multipliers ticket field showing the chosen leverage. Clicking opens a
 * picker (Phase E). Read-only display for now — receives `value` from the
 * parent panel's state.
 */
export function MultiplierField({ value, onOpen }: MultiplierFieldProps) {
  return (
    <Field label="Multiplier" trailing={<InfoDot label="Multiplier info" />}>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex flex-1 items-center justify-between gap-2 bg-transparent text-left",
        )}
      >
        <span className="font-mono text-[14px] font-semibold tabular-nums text-opt-ink">
          x{value}
        </span>
        <CaretDownIcon className="h-3.5 w-3.5 text-opt-ink-3" />
      </button>
    </Field>
  );
}
