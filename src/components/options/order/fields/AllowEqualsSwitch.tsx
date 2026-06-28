"use client";

import { cn } from "@/lib/cn";

interface SwitchRowProps {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}

/**
 * Inline label + iOS-style switch row, e.g. "Allow equals" toggle on
 * Rise/Fall, "Take profit" toggle on Accumulators.
 *
 * Generic name: any boolean toggle row should use this — the field-specific
 * wrappers (TakeProfitField etc.) just provide their label.
 */
export function AllowEqualsSwitch({ label, value, onChange }: SwitchRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 text-[12.5px] text-opt-ink-2">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        style={value ? { backgroundColor: "#00A79E" } : undefined}
        className={cn(
          "relative h-[20px] w-[36px] flex-shrink-0 rounded-full border-0 p-0",
          "transition-colors duration-150",
          // Deriv §12: active toggle = teal #00A79E.
          value ? "" : "bg-opt-line-strong",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white",
            "shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
            "transition-transform duration-150",
            value && "translate-x-4",
          )}
        />
      </button>
    </div>
  );
}
