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
 * Directional sub-tabs (Deriv DTrader §6.1). Two equal-width tabs; the active
 * one always gets **teal** text + a teal underline (the direction's green/red
 * only shows up on the Buy button, per the spec's sub-tab state table).
 */
export function RiseFallToggle({
  value,
  onChange,
  labels = { rise: "Rise", fall: "Fall" },
}: SideToggleProps) {
  return (
    <div className="grid grid-cols-2 border-b border-opt-line">
      <Tab on={value === "rise"} onClick={() => onChange("rise")}>
        {labels.rise}
      </Tab>
      <Tab on={value === "fall"} onClick={() => onChange("fall")}>
        {labels.fall}
      </Tab>
    </div>
  );
}

function Tab({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "relative -mb-px border-0 bg-transparent px-2 py-2.5 text-[14px] font-semibold",
        "transition-colors duration-150",
        // Deriv brand teal #00A79E for the active tab; gray otherwise.
        on ? "text-[#00A79E]" : "text-opt-ink-3 hover:text-opt-ink",
      )}
    >
      {children}
      {on && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] bg-[#00A79E]"
        />
      )}
    </button>
  );
}
