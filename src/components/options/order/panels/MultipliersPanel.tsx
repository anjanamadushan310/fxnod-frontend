"use client";

import { useState } from "react";
import { usePanelBuy } from "@/hooks/usePanelBuy";
import { buildProposalRequest } from "../buildProposalRequest";
import { TradeConfirmed } from "../TradeConfirmed";
import { HowToTradeLink } from "../HowToTradeLink";
import { BuyButton } from "../fields/BuyButton";
import { MultiplierField } from "../fields/MultiplierField";
import { RiskManagementField } from "../fields/RiskManagementField";
import {
  RiskManagementDrawer,
  type RiskManagementConfig,
} from "../fields/RiskManagementDrawer";
import { type Side } from "../fields/RiseFallToggle";
import { StakeField } from "../fields/StakeField";
import { SummaryRow } from "../fields/SummaryRow";
import { UpDownToggle } from "../fields/UpDownToggle";

interface MultipliersPanelProps {
  symbol: string;
}

export function MultipliersPanel({ symbol }: MultipliersPanelProps) {
  const [side, setSide] = useState<Side>("rise");
  const [multiplier] = useState<number>(400);
  const [stake, setStake] = useState<number>(10);
  const [riskOpen, setRiskOpen] = useState(false);
  const [risk, setRisk] = useState<RiskManagementConfig>({
    stopLoss: null,
    takeProfit: null,
  });

  const request =
    stake > 0
      ? buildProposalRequest({
          contractType: "multipliers",
          symbol,
          stake,
          side,
          multiplier,
          stopLoss: risk.stopLoss,
          takeProfit: risk.takeProfit,
        })
      : null;

  const { buyPhase, lastTrade, canBuy, payoutLabel, errorMsg, handleBuy, handleNewTrade } =
    usePanelBuy(request);

  if (buyPhase === "confirmed" && lastTrade) {
    return <TradeConfirmed trade={lastTrade} side={side} onNewTrade={handleNewTrade} />;
  }

  const commission = +(stake * 0.00146).toFixed(2);

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <HowToTradeLink contractLabel="Multipliers" />
      <UpDownToggle value={side} onChange={setSide} />
      <MultiplierField
        value={multiplier}
        onOpen={() => {
          /* picker not yet implemented — multiplier stays at selected value */
        }}
      />
      <StakeField value={stake} onChange={setStake} min={1} max={2000} />
      <RiskManagementField
        summary={summariseRisk(risk)}
        onOpen={() => setRiskOpen((v) => !v)}
      />
      {riskOpen && (
        <RiskManagementDrawer
          value={risk}
          onChange={setRisk}
          onClose={() => setRiskOpen(false)}
        />
      )}
      <div className="flex flex-col gap-1.5 py-1">
        <SummaryRow label="Stop out" value={`${stake.toFixed(2)} USD`} />
        <SummaryRow label="Commission" value={`${commission.toFixed(2)} USD`} />
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

function summariseRisk({ stopLoss, takeProfit }: RiskManagementConfig): string | null {
  const parts: string[] = [];
  if (stopLoss !== null) parts.push(`SL ${stopLoss}`);
  if (takeProfit !== null) parts.push(`TP ${takeProfit}`);
  return parts.length ? parts.join("  ") : null;
}
