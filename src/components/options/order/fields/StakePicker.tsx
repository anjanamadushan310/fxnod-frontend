"use client";

import { useState } from "react";
import { Keyboard, Zap } from "lucide-react";
import { cn } from "@/lib/cn";

/** Quick-select stake presets (Deriv §6.1). */
const PRESETS = [1, 5, 10, 20, 50, 100];

interface StakePickerProps {
  value: number;
  currency: string;
  min?: number;
  max?: number;
  onSelect: (n: number) => void;
}

/**
 * Floating stake picker: ⚡ quick-grid of preset amounts (selected = near-black
 * fill) and ⌨ keyboard entry, clamped to [min, max].
 */
export function StakePicker({
  value,
  currency,
  min,
  max,
  onSelect,
}: StakePickerProps) {
  const [mode, setMode] = useState<"grid" | "keyboard">("grid");
  const [manual, setManual] = useState(String(value));

  const clamp = (n: number) =>
    Math.min(max ?? Infinity, Math.max(min ?? 0, n));

  const commitManual = () => {
    const n = Number(manual);
    if (Number.isFinite(n) && n > 0) onSelect(clamp(n));
  };

  return (
    <div className="w-[224px] overflow-hidden rounded-xl border border-opt-line bg-opt-bg-elev shadow-[0_20px_50px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-1 border-b border-opt-line p-2">
        <ModeBtn on={mode === "grid"} onClick={() => setMode("grid")} label="Quick select">
          <Zap className="h-4 w-4" />
        </ModeBtn>
        <ModeBtn
          on={mode === "keyboard"}
          onClick={() => setMode("keyboard")}
          label="Keyboard entry"
        >
          <Keyboard className="h-4 w-4" />
        </ModeBtn>
      </div>

      <div className="p-2">
        {mode === "grid" ? (
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((n) => {
              const selected = n === value;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onSelect(clamp(n))}
                  className={cn(
                    "rounded-md py-2 text-[13px] font-semibold tabular-nums transition-colors",
                    selected
                      ? "bg-opt-ink text-opt-bg"
                      : "bg-opt-bg-sunk text-opt-ink hover:bg-opt-line",
                  )}
                >
                  {n} {currency}
                </button>
              );
            })}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commitManual();
            }}
          >
            <div className="flex items-center gap-1.5 rounded-md border border-opt-line bg-opt-bg-sunk px-3 py-2 focus-within:border-[#00A79E]">
              <input
                autoFocus
                inputMode="decimal"
                value={manual}
                onChange={(e) =>
                  setManual(e.target.value.replace(/[^0-9.]/g, ""))
                }
                aria-label="Stake amount"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-semibold tabular-nums text-opt-ink outline-none"
              />
              <span className="text-[13px] font-medium text-opt-ink-3">
                {currency}
              </span>
            </div>
            {min !== undefined && max !== undefined && (
              <p className="mt-1.5 text-[11px] text-opt-ink-3">
                min {min} · max {max.toLocaleString()} · Enter to apply
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function ModeBtn({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md transition-colors",
        on ? "bg-opt-bg-sunk text-opt-ink" : "text-opt-ink-3 hover:text-opt-ink",
      )}
    >
      {children}
    </button>
  );
}
