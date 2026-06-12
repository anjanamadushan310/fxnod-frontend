"use client";

import { useState } from "react";
import { usePanelBuy } from "@/hooks/usePanelBuy";
import { buildProposalRequest } from "../buildProposalRequest";
import { TradeConfirmed } from "../TradeConfirmed";
import { HowToTradeLink } from "../HowToTradeLink";
import { BuyButton } from "../fields/BuyButton";
import { DurationField, type DurationValue } from "../fields/DurationField";
import { RiseFallToggle, type Side } from "../fields/RiseFallToggle";
import { StakeField } from "../fields/StakeField";

interface EvenOddPanelProps {
  symbol: string;
}

export function EvenOddPanel({ symbol }: EvenOddPanelProps) {
  const [side, setSide] = useState<Side>("rise");
  const [duration, setDuration] = useState<DurationValue>({ amount: 5, unit: "ticks" });
  const [stake, setStake] = useState<number>(10);

  const request =
    stake > 0
      ? buildProposalRequest({
          contractType: "even_odd",
          symbol,
          stake,
          side,
          duration: { amount: duration.amount, unit: duration.unit },
        })
      : null;

  const { buyPhase, lastTrade, canBuy, payoutLabel, errorMsg, handleBuy, handleNewTrade } =
    usePanelBuy(request);

  if (buyPhase === "confirmed" && lastTrade) {
    return <TradeConfirmed trade={lastTrade} side={side} onNewTrade={handleNewTrade} />;
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <HowToTradeLink contractLabel="Even/Odd" />
      <RiseFallToggle
        value={side}
        onChange={setSide}
        labels={{ rise: "Even", fall: "Odd" }}
      />
      <DurationField value={duration} onChange={setDuration} />
      <StakeField value={stake} onChange={setStake} min={1} max={2000} />
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
