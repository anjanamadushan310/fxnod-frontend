"use client";

import { cn } from "@/lib/cn";

/**
 * `Side` is the semantic name: `rise` = bullish/green/up, `fall` =
 * bearish/red/down. The same toggle pattern is reused for Rise/Fall,
 * Up/Down, Higher/Lower, etc.
 */
export type Side = "rise" | "fall";

interface SideToggleProps {
  value: Side;
  onChange: (next: Side) => void;
  /** Override the visible labels — defaults to "Rise"/"Fall". */
  labels?: { rise: string; fall: string };
}

/**
 * Two-pill segmented switch with a sliding thumb. The Side label takes the
 * rise/fall colour when active.
 *
 * Thumb is CSS-translate driven — the two cells are guaranteed equal-width
 * so no measurement is needed.
 */
export function RiseFallToggle({
  value,
  onChange,
  labels = { rise: "Rise", fall: "Fall" },
}: SideToggleProps) {
  return (
    <div
      className={cn(
        "relative grid grid-cols-2 gap-0 rounded-[10px] bg-opt-bg-sunk p-[3px]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-lg bg-opt-bg-elev",
          "shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]",
          "transition-transform duration-200 ease-out",
          value === "fall" && "translate-x-full",
        )}
      />
      <Pill
        side="rise"
        on={value === "rise"}
        onClick={() => onChange("rise")}
      >
        {labels.rise}
      </Pill>
      <Pill
        side="fall"
        on={value === "fall"}
        onClick={() => onChange("fall")}
      >
        {labels.fall}
      </Pill>
    </div>
  );
}

function Pill({
  side,
  on,
  onClick,
  children,
}: {
  side: Side;
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative z-10 rounded-lg border-0 bg-transparent px-2.5 py-2.5 text-[13.5px] font-semibold",
        "transition-colors duration-150",
        on
          ? side === "rise"
            ? "text-opt-rise"
            : "text-opt-fall"
          : "text-opt-ink-3",
      )}
    >
      {children}
    </button>
  );
}
