"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { CONTRACT_TYPES, type ContractTypeId } from "./contractTypes";

/** Category grouping for the flyout (Deriv §11). */
const CATEGORIES: { label: string; ids: ContractTypeId[] }[] = [
  {
    label: "Growth based",
    ids: ["accumulators", "multipliers", "turbos", "vanillas"],
  },
  { label: "Directional", ids: ["rise_fall", "higher_lower", "touch_no_touch"] },
  { label: "Digit based", ids: ["matches_differs", "over_under", "even_odd"] },
];

const byId = (id: ContractTypeId) =>
  CONTRACT_TYPES.find((c) => c.id === id)!;

interface TradeTypesFlyoutProps {
  activeType: ContractTypeId;
  onSelect: (id: ContractTypeId) => void;
}

/**
 * "Trade types" flyout (Deriv §11): All / Most-traded tabs (red underline),
 * categorized rows (Growth based / Directional / Digit based), 🔥 on trending
 * types, active row highlighted. Positioning + dismiss are owned by the
 * AnchoredPopover wrapper in TopBar.
 */
export function TradeTypesFlyout({ activeType, onSelect }: TradeTypesFlyoutProps) {
  const [tab, setTab] = useState<"all" | "most">("all");

  const categories =
    tab === "all"
      ? CATEGORIES
      : CATEGORIES.map((c) => ({
          ...c,
          ids: c.ids.filter((id) => byId(id).trending),
        })).filter((c) => c.ids.length > 0);

  return (
    <div className="w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-opt-line bg-opt-bg-elev shadow-[0_20px_50px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-opt-line px-4 py-3">
        <h3 className="text-[15px] font-bold text-opt-ink">Trade types</h3>
        <button
          type="button"
          className="rounded-full bg-opt-bg-sunk px-3 py-1 text-[12px] font-medium text-opt-ink-2 transition-colors hover:text-opt-ink"
        >
          Guide
        </button>
      </div>

      {/* All / Most traded tabs */}
      <div className="flex gap-4 border-b border-opt-line px-4">
        <FlyoutTab on={tab === "all"} onClick={() => setTab("all")}>
          All
        </FlyoutTab>
        <FlyoutTab on={tab === "most"} onClick={() => setTab("most")}>
          Most traded
        </FlyoutTab>
      </div>

      {/* Categorized rows */}
      <div className="max-h-[min(60vh,460px)] overflow-y-auto py-1.5 [scrollbar-width:thin]">
        {categories.map((cat) => (
          <div key={cat.label} className="px-2 pb-1">
            <p className="px-2 pb-1 pt-2 text-[11px] font-medium text-opt-ink-3">
              {cat.label}
            </p>
            {cat.ids.map((id) => {
              const ct = byId(id);
              const active = id === activeType;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  className={cn(
                    "flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left text-[14px] transition-colors",
                    active
                      ? "bg-opt-bg-sunk font-medium text-opt-ink"
                      : "text-opt-ink-2 hover:bg-opt-bg-sunk hover:text-opt-ink",
                  )}
                >
                  {ct.label}
                  {ct.trending && <span className="text-[12px]">🔥</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlyoutTab({
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
      className={cn(
        "relative -mb-px py-2.5 text-[13px] font-medium transition-colors",
        on ? "text-opt-ink" : "text-opt-ink-3 hover:text-opt-ink",
      )}
    >
      {children}
      {on && (
        // §11: active tab underline is red.
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#FF4444]" />
      )}
    </button>
  );
}
