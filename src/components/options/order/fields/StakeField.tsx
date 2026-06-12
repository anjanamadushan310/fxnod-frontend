"use client";

import { MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { Field } from "./Field";

interface StakeFieldProps {
  value: number;
  currency?: string;
  /** Optional min/max display in the hint row. */
  min?: number;
  max?: number;
  /** Show the -/+ stepper buttons on the right. */
  withSteppers?: boolean;
  /** Step size when steppers are clicked. */
  step?: number;
  onChange: (next: number) => void;
}

/**
 * Numeric stake input with optional currency suffix and ±step buttons.
 *
 * NOTE: re-renders only on its own value change. ChartPanel's tick storm
 * does NOT touch this — it lives in the OrderPanel subtree.
 */
export function StakeField({
  value,
  currency = "USD",
  min,
  max,
  withSteppers = true,
  step = 1,
  onChange,
}: StakeFieldProps) {
  const hint =
    min !== undefined && max !== undefined
      ? `min ${min} · max ${max.toLocaleString()}`
      : undefined;

  const setNumeric = (raw: string) => {
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(n);
  };

  return (
    <Field label="Stake" hint={hint}>
      <input
        type="text"
        inputMode="decimal"
        value={value.toString()}
        onChange={(e) => setNumeric(e.target.value)}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-semibold tabular-nums text-opt-ink",
          "outline-none placeholder:text-opt-ink-4",
        )}
      />
      <span className="text-[13px] font-medium text-opt-ink-3">{currency}</span>
      {withSteppers && (
        <div className="ml-1 flex gap-0.5">
          <Stepper
            ariaLabel="Decrease stake"
            disabled={min !== undefined && value <= min}
            onClick={() => onChange(Math.max(min ?? -Infinity, value - step))}
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </Stepper>
          <Stepper
            ariaLabel="Increase stake"
            disabled={max !== undefined && value >= max}
            onClick={() => onChange(Math.min(max ?? Infinity, value + step))}
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </Stepper>
        </div>
      )}
    </Field>
  );
}

function Stepper({
  ariaLabel,
  disabled,
  onClick,
  children,
}: {
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid h-6 w-6 place-items-center rounded-md border-0 bg-opt-bg-sunk text-opt-ink-2",
        "transition-colors hover:bg-opt-line hover:text-opt-ink",
        "disabled:opacity-40 disabled:hover:bg-opt-bg-sunk",
      )}
    >
      {children}
    </button>
  );
}
