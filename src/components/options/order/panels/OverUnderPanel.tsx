"use client";

import { useEffect, useState } from "react";
import { usePanelBuy } from "@/hooks/usePanelBuy";
import { useDigitStats } from "@/hooks/useDigitStats";
import { buildProposalRequest } from "../buildProposalRequest";
import { TradeConfirmed } from "../TradeConfirmed";
import { HowToTradeLink } from "../HowToTradeLink";
import { BuyButton } from "../fields/BuyButton";
import { DurationField, type DurationValue } from "../fields/DurationField";
import { LastDigitGrid } from "../fields/LastDigitGrid";
import { RiseFallToggle, type Side } from "../fields/RiseFallToggle";
import { StakeField } from "../fields/StakeField";

interface OverUnderPanelProps {
  symbol: string;
}

export function OverUnderPanel({ symbol }: OverUnderPanelProps) {
  // side "rise" = Over (can't be over 9), "fall" = Under (can't be under 0).
  const [side, setSide] = useState<Side>("rise");
  const [digit, setDigit] = useState<number>(5);
  const [duration, setDuration] = useState<DurationValue>({ amount: 5, unit: "ticks" });
  const [stake, setStake] = useState<number>(10);
  const stats = useDigitStats();

  const disabledDigits = side === "rise" ? [9] : [0];
  // Keep the pick valid when the direction flips onto a disabled digit.
  useEffect(() => {
    if (side === "rise" && digit === 9) setDigit(8);
    if (side === "fall" && digit === 0) setDigit(1);
  }, [side, digit]);

  const request =
    stake > 0
      ? buildProposalRequest({
          contractType: "over_under",
          symbol,
          stake,
          side,
          duration: { amount: duration.amount, unit: duration.unit },
          digit,
        })
      : null;

  const { buyPhase, lastTrade, canBuy, payoutLabel, errorMsg, handleBuy, handleNewTrade } =
    usePanelBuy(request);

  if (buyPhase === "confirmed" && lastTrade) {
    return <TradeConfirmed trade={lastTrade} side={side} onNewTrade={handleNewTrade} />;
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <HowToTradeLink contractLabel="Over/Under" />
      <RiseFallToggle
        value={side}
        onChange={setSide}
        labels={{ rise: "Over", fall: "Under" }}
      />
      <LastDigitGrid
        value={digit}
        onChange={setDigit}
        percentages={stats}
        disabledDigits={disabledDigits}
      />
      <DurationField value={duration} onChange={setDuration} />
      <StakeField value={stake} onChange={setStake} min={1} max={2000} />
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
