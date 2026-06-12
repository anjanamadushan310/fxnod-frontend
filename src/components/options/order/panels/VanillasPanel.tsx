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
import { SummaryRow } from "../fields/SummaryRow";

interface VanillasPanelProps {
  symbol: string;
}

export function VanillasPanel({ symbol }: VanillasPanelProps) {
  const [side, setSide] = useState<Side>("rise");
  const [duration, setDuration] = useDefaultDuration();
  const [strike, setStrike] = useState<number>(0);
  const [stake, setStake] = useState<number>(10);

  const request =
    stake > 0
      ? buildProposalRequest({
          contractType: "vanillas",
          symbol,
          stake,
          side,
          duration: { amount: duration.amount, unit: duration.unit },
          barrier: strike,
        })
      : null;

  const { buyPhase, lastTrade, canBuy, payoutLabel, errorMsg, handleBuy, handleNewTrade } =
    usePanelBuy(request);

  if (buyPhase === "confirmed" && lastTrade) {
    return <TradeConfirmed trade={lastTrade} side={side} onNewTrade={handleNewTrade} />;
  }

  // Payout per point is a Deriv-proposal field not yet in ProposalResponse — placeholder.
  const payoutPerPoint = (stake * 0.97769).toFixed(6);

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <HowToTradeLink contractLabel="Vanillas" />
      <RiseFallToggle
        value={side}
        onChange={setSide}
        labels={{ rise: "Call", fall: "Put" }}
      />
      <DurationField value={duration} onChange={setDuration} />
      <OffsetField
        label="Strike price"
        value={strike}
        onChange={setStrike}
        withInfo
        infoLabel="Strike price info"
      />
      <StakeField value={stake} onChange={setStake} min={1} max={2000} />
      <div className="py-1">
        <SummaryRow label="Payout per point" value={`${payoutPerPoint} USD`} />
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
