"use client";

import { memo } from "react";
import { cn } from "@/lib/cn";
import type { Position } from "@/hooks/useMockPositions";

interface PositionCardProps {
  position: Position;
  /** Optional: open the contract details modal. */
  onOpenDetails?: (id: string) => void;
  /** Optional: sell early (resale offered). */
  onSell?: (id: string) => void;
}

const SIDE_DOT_COLOUR: Record<string, string> = {
  rise: "var(--opt-rise)",
  up: "var(--opt-rise)",
  fall: "var(--opt-fall)",
  down: "var(--opt-fall)",
  accum: "#2563eb",
};

/**
 * Single open-position card.
 *
 * Memoised because the parent (PositionsDrawer) re-renders every tick due
 * to live P/L — but a card only needs to repaint when *its* row's data
 * changes. Reference-equal Position objects skip re-render.
 */
function PositionCardInner({
  position,
  onOpenDetails,
  onSell,
}: PositionCardProps) {
  const pnlPositive = position.pnl >= 0;
  const status: "won" | "lost" | "open" = position.outcome ?? "open";

  return (
    <article
      data-status={status}
      onClick={() => onOpenDetails?.(position.id)}
      className={cn(
        "grid cursor-pointer grid-cols-[auto_1fr_auto] items-start gap-2.5 rounded-[10px] border bg-opt-bg-elev px-3 py-2.5",
        status === "open" && "border-opt-line hover:border-opt-line-strong",
        status === "won" && "border-opt-rise/40 bg-opt-rise-soft",
        status === "lost" && "border-opt-fall/30 bg-opt-fall-soft",
      )}
    >
      <span
        aria-hidden
        className="mt-2 h-2 w-2 flex-shrink-0 rounded-full"
        style={{ background: SIDE_DOT_COLOUR[position.side] ?? "var(--opt-ink-3)" }}
      />

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-1.5 truncate text-[12.5px] font-semibold text-opt-ink">
          <span className="truncate">{position.marketName}</span>
          {position.status && (
            <span className="font-mono text-[11px] font-medium text-opt-ink-3">
              · {position.status}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px] text-opt-ink-3">
          <KV label="Stake" value={`${position.stake.toFixed(2)} USD`} />
          <KV label="Contract value" value={`${position.contractValue.toFixed(2)} USD`} />
          {position.entrySpot !== undefined && (
            <KV label="Entry spot" value={position.entrySpot.toFixed(2)} />
          )}
          {position.barrier !== undefined && (
            <KV label="Barrier" value={String(position.barrier)} />
          )}
          {position.takeProfit !== undefined && (
            <KV
              label="Take profit"
              value={position.takeProfit === null ? "—" : `${position.takeProfit.toFixed(2)} USD`}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <span
          className={cn(
            "font-mono text-[13px] font-bold tabular-nums",
            pnlPositive ? "text-opt-rise" : "text-opt-fall",
          )}
        >
          {pnlPositive ? "+" : ""}
          {position.pnl.toFixed(2)} USD
        </span>
        {onSell && status === "open" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSell(position.id);
            }}
            className={cn(
              "rounded-md border border-opt-ink bg-opt-ink px-2.5 py-[3px] font-mono text-[11.5px] font-semibold tabular-nums text-opt-bg",
              "transition-[filter] hover:brightness-110",
            )}
          >
            Sell
          </button>
        )}
      </div>
    </article>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1 truncate">
      <span className="font-sans">{label}:</span>
      <span className="truncate font-medium text-opt-ink">{value}</span>
    </div>
  );
}

export const PositionCard = memo(PositionCardInner);
