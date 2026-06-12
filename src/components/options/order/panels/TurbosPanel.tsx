"use client";

import { useState } from "react";
import { usePanelBuy } from "@/hooks/usePanelBuy";
import { buildProposalRequest } from "../buildProposalRequest";
import { TradeConfirmed } from "../TradeConfirmed";
import { HowToTradeLink } from "../HowToTradeLink";
import { BuyButton } from "../fields/BuyButton";
import { DurationField, useDefaultDuration } from "../fields/DurationField";
import { PayoutPerPointField } from "../fields/PayoutPerPointField";
import { type Side } from "../fields/RiseFallToggle";
import { StakeField } from "../fields/StakeField";
import { SummaryRow } from "../fields/SummaryRow";
import { TakeProfitField } from "../fields/TakeProfitField";
import { UpDownToggle } from "../fields/UpDownToggle";

interface TurbosPanelProps {
  symbol: string;
}

export function TurbosPanel({ symbol }: TurbosPanelProps) {
  const [side, setSide] = useState<Side>("rise");
  const [duration, setDuration] = useDefaultDuration();
  const [stake, setStake] = useState<number>(10);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);

  const request =
    stake > 0
      ? buildProposalRequest({
          contractType: "turbos",
          symbol,
          stake,
          side,
          duration: { amount: duration.amount, unit: duration.unit },
          takeProfit,
        })
      : null;

  const { buyPhase, lastTrade, canBuy, payoutLabel, errorMsg, handleBuy, handleNewTrade } =
    usePanelBuy(request);

  if (buyPhase === "confirmed" && lastTrade) {
    return <TradeConfirmed trade={lastTrade} side={side} onNewTrade={handleNewTrade} />;
  }

  // Barrier is a read-only field populated by Deriv's proposal; show placeholder until wired.
  const barrierPlaceholder = side === "rise" ? "-6.46" : "+6.46";

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <HowToTradeLink contractLabel="Turbos" />
      <UpDownToggle value={side} onChange={setSide} />
      <DurationField value={duration} onChange={setDuration} />
      <StakeField value={stake} onChange={setStake} min={1} max={2000} />
      <PayoutPerPointField value={1.5} />
      <TakeProfitField
        value={takeProfit}
        onToggle={(on) => setTakeProfit(on ? 20 : null)}
        onChange={setTakeProfit}
      />
      <div className="py-1">
        <SummaryRow label="Barrier" value={barrierPlaceholder} />
      </div>
      {errorMsg && (
        <p className="px-1 text-[11px] leading-snug text-opt-fall">{errorMsg}</p>
      )}
      <div className="mt-auto">
        <BuyButton
          side={side}
          disabled={!canBuy}
          payoutLabel={payoutLabel}
          label={buyPhase !== "idle" ? "Placing…" : "Buy"}
          onClick={handleBuy}
        />
      </div>
    </div>
  );
}
