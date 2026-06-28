"use client";

import { BarsIcon, ExpandIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import type { ContractDetail } from "./contractDetail";

/**
 * Closed-position card (Deriv §10): asset icon + name + expand, trade-type /
 * stake row, then a teal "Closed" badge + the final P&L (green win / red loss).
 */
export function ClosedPositionCard({
  contract,
  onOpenDetails,
}: {
  contract: ContractDetail;
  onOpenDetails: (c: ContractDetail) => void;
}) {
  const lost = contract.outcome === "lost";
  return (
    <article className="flex flex-col gap-2 rounded-[10px] border border-opt-line bg-opt-bg-elev px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md bg-opt-bg-sunk text-opt-ink-3"
        >
          <BarsIcon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-opt-ink">
          {contract.marketName}
        </span>
        <button
          type="button"
          aria-label="Contract details"
          onClick={() => onOpenDetails(contract)}
          className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md text-opt-ink-3 transition-colors hover:bg-opt-bg-sunk hover:text-opt-ink"
        >
          <ExpandIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[12px]">
        <span className="text-opt-ink-2">{contract.tradeTypeLabel}</span>
        <span className="font-mono font-medium tabular-nums text-opt-ink">
          {contract.stake.toFixed(2)} USD
        </span>
      </div>

      <div className="flex items-center justify-between text-[12px]">
        {/* §12: teal "Closed" badge, white text. */}
        <span className="rounded bg-[#00A79E] px-2 py-0.5 text-[11px] font-semibold text-white">
          Closed
        </span>
        <span
          className={cn(
            "font-mono font-bold tabular-nums",
            lost ? "text-opt-fall" : "text-opt-rise",
          )}
        >
          {lost ? "" : "+"}
          {contract.pnl.toFixed(2)} USD
        </span>
      </div>
    </article>
  );
}
