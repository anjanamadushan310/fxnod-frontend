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

type ActiveType = DurationUnit | "endtime";

interface DurationPickerProps {
  value: DurationValue;
  onSelect: (v: DurationValue) => void;
}

/**
 * Floating duration picker: left column = duration types (active = red
 * left-border), right = preset grid (selected = near-black fill / white text),
 * with ⚡ quick-grid and ⌨ keyboard-entry modes. The "End time" type shows a
 * date + time + Save form (§6.1).
 */
export function DurationPicker({ value, onSelect }: DurationPickerProps) {
  const [activeType, setActiveType] = useState<ActiveType>(value.unit);
  const [mode, setMode] = useState<"grid" | "keyboard">("grid");
  const [manual, setManual] = useState(String(value.amount));

  const isEnd = activeType === "endtime";
  const active = TYPES.find((t) => t.unit === activeType) ?? TYPES[0]!;

  const commitManual = () => {
    if (isEnd) return;
    const n = Math.floor(Number(manual));
    if (Number.isFinite(n) && n > 0) onSelect({ amount: n, unit: active.unit });
  };

  return (
    <div className="w-[300px] overflow-hidden rounded-xl border border-opt-line bg-opt-bg-elev shadow-[0_20px_50px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)]">
      {!isEnd && (
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
      )}

      <div className="grid grid-cols-[104px_1fr]">
        {/* Duration type list */}
        <div className="border-r border-opt-line py-1">
          {TYPES.map((t) => (
            <TypeRow
              key={t.unit}
              label={t.label}
              active={activeType === t.unit}
              onClick={() => setActiveType(t.unit)}
            />
          ))}
          <TypeRow
            label="End time"
            active={isEnd}
            onClick={() => setActiveType("endtime")}
          />
        </div>

        {/* Right pane */}
        <div className="p-2">
          {isEnd ? (
            <EndTimePane onSelect={onSelect} />
          ) : mode === "grid" ? (
            <div className="grid grid-cols-4 gap-1.5">
              {active.presets.map((n) => {
                const selected =
                  active.unit === value.unit && n === value.amount;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onSelect({ amount: n, unit: active.unit })}
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

/** Date + time → Save form. Interprets the entered date/time as GMT/UTC and
 *  commits the equivalent duration-from-now. */
function EndTimePane({ onSelect }: { onSelect: (v: DurationValue) => void }) {
  const [end] = useState(() => defaultEnd());
  const [date, setDate] = useState(end.date);
  const [time, setTime] = useState(end.time);

  const endEpoch = toEpoch(date, time);
  const nowEpoch = Math.floor(Date.now() / 1000);
  const valid = endEpoch !== null && endEpoch > nowEpoch;

  const save = () => {
    if (endEpoch === null || endEpoch <= nowEpoch) return;
    onSelect(fromSeconds(endEpoch - nowEpoch));
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="Expiry date"
        className="w-full rounded-md border border-opt-line bg-opt-bg-sunk px-2 py-1.5 text-[13px] text-opt-ink outline-none focus:border-[#00A79E]"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        aria-label="Expiry time"
        className="w-full rounded-md border border-opt-line bg-opt-bg-sunk px-2 py-1.5 text-[13px] text-opt-ink outline-none focus:border-[#00A79E]"
      />
      <p className="text-[11px] leading-snug text-opt-ink-3">
        Contract will expire on {date || "—"} at {time || "—"} GMT.
      </p>
      <button
        type="button"
        onClick={save}
        disabled={!valid}
        className="rounded-md bg-opt-ink py-1.5 text-[13px] font-semibold text-opt-bg transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}

function TypeRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center border-l-2 px-3 py-2 text-left text-[13px] transition-colors",
        active
          ? "border-[#FF4444] font-medium text-opt-ink"
          : "border-transparent text-opt-ink-3 hover:text-opt-ink",
      )}
    >
      {label}
    </button>
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

// ─── end-time helpers ────────────────────────────────────────────────────────

function defaultEnd(): { date: string; time: string } {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`,
    time: `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`,
  };
}

function toEpoch(date: string, time: string): number | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const tm = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dm || !tm) return null;
  return Math.floor(
    Date.UTC(+dm[1]!, +dm[2]! - 1, +dm[3]!, +tm[1]!, +tm[2]!) / 1000,
  );
}

function fromSeconds(sec: number): DurationValue {
  if (sec >= 3600) return { amount: Math.round(sec / 3600), unit: "h" };
  if (sec >= 60) return { amount: Math.round(sec / 60), unit: "min" };
  return { amount: sec, unit: "s" };
}
