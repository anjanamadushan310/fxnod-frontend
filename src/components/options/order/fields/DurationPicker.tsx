"use client";

import { useState } from "react";
import { Keyboard, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import type { DurationUnit, DurationValue } from "./DurationField";

/** Duration types + preset grids (Deriv §6.1). */
const TYPES: { unit: DurationUnit; label: string; presets: number[] }[] = [
  { unit: "ticks", label: "Ticks", presets: [1, 2, 3, 4, 5, 6, 8, 10] },
  { unit: "s", label: "Seconds", presets: [15, 20, 25, 30, 40, 45, 50, 55] },
  { unit: "min", label: "Minutes", presets: [2, 3, 5, 10, 15, 20, 30, 45] },
  { unit: "h", label: "Hours", presets: [1, 2, 3, 4, 6, 8, 12, 24] },
];

interface DurationPickerProps {
  value: DurationValue;
  onSelect: (v: DurationValue) => void;
}

/**
 * Floating duration picker: left column = duration types (active = red
 * left-border), right = preset grid (selected = near-black fill / white text),
 * with ⚡ quick-grid and ⌨ keyboard-entry modes.
 */
export function DurationPicker({ value, onSelect }: DurationPickerProps) {
  const [activeUnit, setActiveUnit] = useState<DurationUnit>(value.unit);
  const [mode, setMode] = useState<"grid" | "keyboard">("grid");
  const [manual, setManual] = useState(String(value.amount));

  const active = TYPES.find((t) => t.unit === activeUnit) ?? TYPES[0]!;

  const commitManual = () => {
    const n = Math.floor(Number(manual));
    if (Number.isFinite(n) && n > 0) onSelect({ amount: n, unit: activeUnit });
  };

  return (
    <div className="w-[300px] overflow-hidden rounded-xl border border-opt-line bg-opt-bg-elev shadow-[0_20px_50px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)]">
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

      <div className="grid grid-cols-[104px_1fr]">
        {/* Duration type list */}
        <div className="border-r border-opt-line py-1">
          {TYPES.map((t) => (
            <button
              key={t.unit}
              type="button"
              onClick={() => setActiveUnit(t.unit)}
              className={cn(
                "flex w-full items-center border-l-2 px-3 py-2 text-left text-[13px] transition-colors",
                t.unit === activeUnit
                  ? "border-[#FF4444] font-medium text-opt-ink"
                  : "border-transparent text-opt-ink-3 hover:text-opt-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Presets or keyboard entry */}
        <div className="p-2">
          {mode === "grid" ? (
            <div className="grid grid-cols-4 gap-1.5">
              {active.presets.map((n) => {
                const selected = activeUnit === value.unit && n === value.amount;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onSelect({ amount: n, unit: activeUnit })}
                    className={cn(
                      "rounded-md py-2 text-[13px] font-semibold tabular-nums transition-colors",
                      selected
                        ? "bg-opt-ink text-opt-bg"
                        : "bg-opt-bg-sunk text-opt-ink hover:bg-opt-line",
                    )}
                  >
                    {n}
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
              <input
                autoFocus
                inputMode="numeric"
                value={manual}
                onChange={(e) => setManual(e.target.value.replace(/[^0-9]/g, ""))}
                aria-label={`Duration in ${active.label.toLowerCase()}`}
                className="w-full rounded-md border border-opt-line bg-opt-bg-sunk px-3 py-2 text-[14px] font-semibold text-opt-ink outline-none focus:border-[#00A79E]"
              />
              <p className="mt-1.5 text-[11px] text-opt-ink-3">
                {active.label} · press Enter to apply
              </p>
            </form>
          )}
        </div>
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
