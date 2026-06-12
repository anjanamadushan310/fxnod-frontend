"use client";

import { cn } from "@/lib/cn";
import { Field } from "./Field";
import { InfoDot } from "./InfoDot";

interface TakeProfitFieldProps {
  /** null = TP disabled. */
  value: number | null;
  currency?: string;
  onToggle: (enabled: boolean) => void;
  onChange?: (next: number) => void;
}

/**
 * Take-profit field with an enable/disable switch on the right of the label.
 * When disabled we render an em-dash placeholder; when enabled the user can
 * type a number.
 */
export function TakeProfitField({
  value,
  currency = "USD",
  onToggle,
  onChange,
}: TakeProfitFieldProps) {
  const enabled = value !== null;
  return (
    <Field
      label="Take profit"
      trailing={
        <div className="flex items-center gap-1.5">
          <InfoDot label="Take profit info" />
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Enable take profit"
            onClick={() => onToggle(!enabled)}
            className={cn(
              "relative h-[20px] w-[36px] rounded-full border-0 p-0",
              "transition-colors duration-150",
              enabled ? "bg-opt-rise" : "bg-opt-line-strong",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white",
                "shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
                "transition-transform duration-150",
                enabled && "translate-x-4",
              )}
            />
          </button>
        </div>
      }
    >
      {enabled && onChange ? (
        <>
          <input
            type="text"
            inputMode="decimal"
            value={value ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) onChange(n);
            }}
            className={cn(
              "min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-semibold tabular-nums text-opt-ink",
              "outline-none placeholder:text-opt-ink-4",
            )}
            placeholder="0"
          />
          <span className="text-[13px] font-medium text-opt-ink-3">{currency}</span>
        </>
      ) : (
        <span className="text-[14px] font-semibold text-opt-ink-3">—</span>
      )}
    </Field>
  );
}
