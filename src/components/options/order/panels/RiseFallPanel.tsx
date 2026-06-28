"use client";

import { useState } from "react";
import { usePanelBuy } from "@/hooks/usePanelBuy";
import { buildProposalRequest } from "../buildProposalRequest";
import { TradeConfirmed } from "../TradeConfirmed";
import { HowToTradeLink } from "../HowToTradeLink";
import { AllowEqualsSwitch } from "../fields/AllowEqualsSwitch";
import { BuyButton } from "../fields/BuyButton";
import { DurationField, useDefaultDuration } from "../fields/DurationField";
import { RiseFallToggle, type Side } from "../fields/RiseFallToggle";
import { StakeField } from "../fields/StakeField";

interface RiseFallPanelProps {
  symbol: string;
}

export function RiseFallPanel({ symbol }: RiseFallPanelProps) {
  const [side, setSide] = useState<Side>("rise");
  // Spec §13: Rise/Fall defaults to 5 ticks.
  const [duration, setDuration] = useDefaultDuration({ amount: 5, unit: "ticks" });
  const [stake, setStake] = useState<number>(10);
  const [allowEquals, setAllowEquals] = useState<boolean>(false);

  const request =
    stake > 0
      ? buildProposalRequest({
          contractType: "rise_fall",
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
      <HowToTradeLink contractLabel="Rise/Fall" />
      <RiseFallToggle value={side} onChange={setSide} />
      <DurationField value={duration} onChange={setDuration} />
      <StakeField value={stake} onChange={setStake} min={1} max={2000} />
      <AllowEqualsSwitch label="Allow equals" value={allowEquals} onChange={setAllowEquals} />
      {errorMsg && (
        <p className="px-1 text-[11px] leading-snug text-opt-fall">{errorMsg}</p>
      )}
      <div className="mt-auto">
        <BuyButton
          side={side}
          disabled={!canBuy}
          payoutLabel={payoutLabel}
          label={buyPhase !== "idle" ? "Placing…" : "Buy"}
          loading={buyPhase === "buying"}
          onClick={handleBuy}
        />
      </div>
    </div>
  );
}
