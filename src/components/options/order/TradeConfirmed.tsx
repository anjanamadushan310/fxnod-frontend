"use client";

import { cn } from "@/lib/cn";
import type { ConfirmResponse } from "@/services/tradingApi";
import type { BuySide } from "./fields/BuyButton";

interface TradeConfirmedProps {
  trade: ConfirmResponse;
  /** Controls checkmark colour: fall → red, anything else → green. */
  side: BuySide;
  onNewTrade: () => void;
}

export function TradeConfirmed({ trade, side, onNewTrade }: TradeConfirmedProps) {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white text-[13px] font-bold",
            side === "fall" ? "bg-opt-fall" : "bg-opt-rise",
          )}
        >
          ✓
        </span>
        <span className="text-[14px] font-semibold text-opt-ink">Trade placed</span>
      </div>

      <div className="flex flex-col gap-2.5 rounded-xl border border-opt-line bg-opt-bg-sunk p-3.5">
        <TradeRow
          label="Buy price"
          value={`${Number(trade.buy_price).toFixed(2)} USD`}
        />
        <TradeRow
          label="Max payout"
          value={`${Number(trade.payout_amount).toFixed(2)} USD`}
          highlight
        />
        <div className="my-0.5 border-t border-opt-line" />
        <TradeRow label="Contract ID" value={trade.deriv_contract_id} mono />
      </div>

      <p className="text-[11px] leading-relaxed text-opt-ink-3">
        Trade ID:{" "}
        <span className="font-mono">{trade.trade_id}</span>
      </p>

      <div className="mt-auto">
        <button
          type="button"
          onClick={onNewTrade}
          className="w-full rounded-[10px] border border-opt-line bg-transparent py-3 text-[14px] font-semibold text-opt-ink-2 transition-colors hover:bg-opt-bg-sunk"
        >
          New trade
        </button>
      </div>
    </div>
  );
}

function TradeRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-opt-ink-3">{label}</span>
      <span
        className={cn(
          "tabular-nums font-semibold",
          mono ? "font-mono text-[12px] text-opt-ink" : "text-[13px]",
          highlight ? "text-opt-rise" : "text-opt-ink",
        )}
      >
        {value}
      </span>
    </div>
  );
}
