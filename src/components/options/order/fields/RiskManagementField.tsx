"use client";

import { CaretDownIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { Field } from "./Field";
import { InfoDot } from "./InfoDot";

interface RiskManagementFieldProps {
  /** null = none configured; string = compact summary like "SL 5  TP 20". */
  summary?: string | null;
  onOpen?: () => void;
}

/**
 * Multipliers risk-management field — opens an expanded block (Stop loss /
 * Take profit / Deal cancellation) in Phase E. For now it shows an em-dash
 * placeholder + caret to mark itself clickable.
 */
export function RiskManagementField({
  summary = null,
  onOpen,
}: RiskManagementFieldProps) {
  return (
    <Field
      label="Risk management"
      trailing={<InfoDot label="Risk management info" />}
    >
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex flex-1 items-center justify-between gap-2 bg-transparent text-left",
        )}
      >
        <span
          className={cn(
            "font-mono text-[14px] font-semibold tabular-nums",
            summary ? "text-opt-ink" : "text-opt-ink-3",
          )}
        >
          {summary ?? "—"}
        </span>
        <CaretDownIcon className="h-3.5 w-3.5 text-opt-ink-3" />
      </button>
    </Field>
  );
}
