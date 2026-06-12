"use client";

import { useState } from "react";
import { usePanelBuy } from "@/hooks/usePanelBuy";
import { buildProposalRequest } from "../buildProposalRequest";
import { TradeConfirmed } from "../TradeConfirmed";
import { HowToTradeLink } from "../HowToTradeLink";
import { BuyButton } from "../fields/BuyButton";
import { DurationField, useDefaultDuration } from "../fields/DurationField";
import { OffsetField } from "../fields/OffsetField";
import { RiseFallToggle, type Side } from "../fields/RiseFallToggle";
import { StakeField } from "../fields/StakeField";

interface TouchNoTouchPanelProps {
  symbol: string;
}

export function TouchNoTouchPanel({ symbol }: TouchNoTouchPanelProps) {
  const [side, setSide] = useState<Side>("rise");
  const [duration, setDuration] = useDefaultDuration();
  const [barrier, setBarrier] = useState<number>(1.17);
  const [stake, setStake] = useState<number>(10);

  const request =
    stake > 0
      ? buildProposalRequest({
          contractType: "touch_no_touch",
          symbol,
          stake,
          side,
          duration: { amount: duration.amount, unit: duration.unit },
          barrier,
        })
      : null;

  const { buyPhase, lastTrade, canBuy, payoutLabel, errorMsg, handleBuy, handleNewTrade } =
    usePanelBuy(request);

  if (buyPhase === "confirmed" && lastTrade) {
    return <TradeConfirmed trade={lastTrade} side={side} onNewTrade={handleNewTrade} />;
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <HowToTradeLink contractLabel="Touch/No Touch" />
      <RiseFallToggle
        value={side}
        onChange={setSide}
        labels={{ rise: "Touch", fall: "No Touch" }}
      />
      <DurationField value={duration} onChange={setDuration} />
      <OffsetField label="Barrier" value={barrier} onChange={setBarrier} />
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
