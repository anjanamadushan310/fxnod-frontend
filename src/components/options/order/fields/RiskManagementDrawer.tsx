"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { AllowEqualsSwitch } from "./AllowEqualsSwitch";

export interface RiskManagementConfig {
  stopLoss: number | null;
  takeProfit: number | null;
}

interface RiskManagementDrawerProps {
  value: RiskManagementConfig;
  onChange: (next: RiskManagementConfig) => void;
  onClose: () => void;
}

/**
 * Expanded block opened from the Multipliers ticket's "Risk management"
 * field. Hosts two toggleable amount fields: Stop loss + Take profit.
 *
 * Owns no live data. Closing semantics:
 *   - Outside-click closes (matches MarketPicker behaviour)
 *   - Escape closes
 *
 * The drawer is inline (not a portal) so it stays in document flow above
 * the Stop out / Commission rows.
 */
export function RiskManagementDrawer({
  value,
  onChange,
  onClose,
}: RiskManagementDrawerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(
      () => document.addEventListener("mousedown", onClick),
      0,
    );
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2.5 rounded-[10px] border border-opt-line bg-opt-bg-sunk px-3 py-2.5",
      )}
    >
      <AmountRow
        label="Stop loss"
        value={value.stopLoss}
        onToggle={(on) =>
          onChange({ ...value, stopLoss: on ? 5 : null })
        }
        onChange={(n) => onChange({ ...value, stopLoss: n })}
      />
      <AmountRow
        label="Take profit"
        value={value.takeProfit}
        onToggle={(on) =>
          onChange({ ...value, takeProfit: on ? 20 : null })
        }
        onChange={(n) => onChange({ ...value, takeProfit: n })}
      />
    </div>
  );
}

function AmountRow({
  label,
  value,
  onToggle,
  onChange,
}: {
  label: string;
  value: number | null;
  onToggle: (on: boolean) => void;
  onChange: (next: number) => void;
}) {
  const on = value !== null;
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-opt-line bg-opt-bg-elev px-2.5 py-2">
      <AllowEqualsSwitch label={label} value={on} onChange={onToggle} />
      {on && (
        <div className="flex items-center gap-1.5">
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
          />
          <span className="text-[13px] font-medium text-opt-ink-3">USD</span>
        </div>
      )}
    </div>
  );
}
