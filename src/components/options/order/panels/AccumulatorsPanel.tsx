"use client";

import { useState } from "react";
import { usePanelBuy } from "@/hooks/usePanelBuy";
import { buildProposalRequest } from "../buildProposalRequest";
import { TradeConfirmed } from "../TradeConfirmed";
import { HowToTradeLink } from "../HowToTradeLink";
import { BuyButton } from "../fields/BuyButton";
import { GrowthRatePills } from "../fields/GrowthRatePills";
import { StakeField } from "../fields/StakeField";
import { SummaryRow } from "../fields/SummaryRow";
import { TakeProfitField } from "../fields/TakeProfitField";

interface AccumulatorsPanelProps {
  symbol: string;
}

export function AccumulatorsPanel({ symbol }: AccumulatorsPanelProps) {
  const [growthRate, setGrowthRate] = useState<number>(3);
  const [stake, setStake] = useState<number>(10);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);

  const request =
    stake > 0
      ? buildProposalRequest({
          contractType: "accumulators",
          symbol,
          stake,
          growthRate,
          takeProfit,
        })
      : null;

  const { buyPhase, lastTrade, canBuy, payoutLabel, errorMsg, handleBuy, handleNewTrade } =
    usePanelBuy(request);

  if (buyPhase === "confirmed" && lastTrade) {
    return <TradeConfirmed trade={lastTrade} side="neutral" onNewTrade={handleNewTrade} />;
  }

  const barrier = approximateBarrier(growthRate);

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <HowToTradeLink contractLabel="Accumulators" />
      <GrowthRatePills value={growthRate} onChange={setGrowthRate} />
      <StakeField value={stake} onChange={setStake} min={1} max={2000} />
      <TakeProfitField
        value={takeProfit}
        onToggle={(on) => setTakeProfit(on ? 20 : null)}
        onChange={setTakeProfit}
      />
      <div className="flex flex-col gap-1.5 py-1">
        <SummaryRow label="Barrier" value={`± ${barrier.toFixed(5)}%`} />
        <SummaryRow label="Max. duration" value="85 ticks" />
      </div>
      {errorMsg && (
        <p className="px-1 text-[11px] leading-snug text-opt-fall">{errorMsg}</p>
      )}
      <div className="mt-auto">
        <BuyButton
          side="neutral"
          disabled={!canBuy}
          payoutLabel={payoutLabel}
          label={buyPhase !== "idle" ? "Placing…" : "Buy"}
          onClick={handleBuy}
        />
      </div>
    </div>
  );
}

function approximateBarrier(growthPct: number): number {
  return growthPct * 0.012666;
}
