"use client";

import { useState } from "react";
import { ChartPanel } from "@/components/options/chart/ChartPanel";
import { IconSidebar } from "@/components/options/layout/IconSidebar";
import { OptionsShell } from "@/components/options/layout/OptionsShell";
import { TopBar } from "@/components/options/layout/TopBar";
import { findMarket } from "@/components/options/market/catalog";
import { OrderPanel } from "@/components/options/order/OrderPanel";
import { PositionsDrawer } from "@/components/options/positions/PositionsDrawer";
import type { ContractTypeId } from "@/components/options/layout/contractTypes";
import type { OptionsAccountMode } from "@/components/options/layout/AccountSelector";

/**
 * /options — Deriv options trading page.
 *
 * Phases A–E live:
 *   A) Shell, IconSidebar, TopBar, AccountSelector, DepositButton
 *   B) ChartPanel — live-ticking SVG
 *   C) OrderPanel — Rise/Fall + Accumulators tickets
 *   D) Multipliers + Turbos tickets + StatsStrip
 *   E.1) MarketPicker dropdown
 *   E.2) PositionsDrawer
 *   E.3) RiskManagement drawer
 *
 * State here is intentionally minimal — only the cross-cutting flags
 * (selected contract type, selected market, positions drawer open) live at
 * the page level. Everything else (live price, balance ticks, ticket
 * inputs) lives in the leaf that owns the subscription.
 */
export default function OptionsPage() {
  const [contractType, setContractType] =
    useState<ContractTypeId>("rise_fall");
  const [accountMode, _setAccountMode] = useState<OptionsAccountMode>("demo");
  const [marketId, setMarketId] = useState<string>("vol_100_1s");
  const [positionsOpen, setPositionsOpen] = useState(false);

  // TODO Phase F: replace with useAccountBalance() subscription.
  const accountBalance = 2503.2;

  const market = findMarket(marketId);
  if (!market) {
    // Defensive — catalog drift after a deploy. Fall back to the default.
    setMarketId("vol_100_1s");
    return null;
  }

  return (
    <>
      <OptionsShell
        sidebar={
          <IconSidebar
            brandInitials="DT"
            theme="light"
            positionsOpen={positionsOpen}
            onPositionsToggle={() => setPositionsOpen((v) => !v)}
            positionsBadge={1}
          />
        }
        topbar={
          <TopBar
            contractType={contractType}
            onContractTypeChange={setContractType}
            accountMode={accountMode}
            accountBalance={accountBalance}
          />
        }
        main={
          <ChartPanel
            marketId={market.id}
            marketName={market.name}
            seedPrice={market.seedPrice}
            showStatsStrip={contractType === "accumulators"}
            onSelectMarket={setMarketId}
          />
        }
        order={<OrderPanel contractType={contractType} symbol={market.id} />}
      />
      {/* Positions drawer slides over from the icon sidebar's right edge */}
      <PositionsDrawer
        open={positionsOpen}
        onClose={() => setPositionsOpen(false)}
      />
    </>
  );
}
