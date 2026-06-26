"use client";

import { Suspense, useState } from "react";
import { ChartPanel } from "@/components/options/chart/ChartPanel";
import { IconSidebar } from "@/components/options/layout/IconSidebar";
import { OptionsShell } from "@/components/options/layout/OptionsShell";
import { TopBar } from "@/components/options/layout/TopBar";
import { findMarket } from "@/components/options/market/catalog";
import { useChartSettings } from "@/hooks/useChartSettings";
import { OrderPanel } from "@/components/options/order/OrderPanel";
import { PositionsDrawer } from "@/components/options/positions/PositionsDrawer";
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
  // ChartPanel reads `useSearchParams()` (via useChartSettings) — Next.js
  // requires a Suspense boundary around any client subtree that does, or the
  // production build errors out. The shell renders instantly; only the
  // search-param read suspends on first paint.
  return (
    <Suspense fallback={null}>
      <OptionsPageInner />
    </Suspense>
  );
}

function OptionsPageInner() {
  const [accountMode, _setAccountMode] = useState<OptionsAccountMode>("demo");
  const [positionsOpen, setPositionsOpen] = useState(false);

  // Market + contract type are URL-driven (`?symbol=`, `?trade_type=`),
  // alongside chart_type + interval. No local state for either.
  const { symbol, setSymbol, tradeType, setTradeType } = useChartSettings();

  // TODO Phase F: replace with useAccountBalance() subscription.
  const accountBalance = 2503.2;

  // `parseSymbol` already guarantees a catalog hit, so `market` is defined —
  // the `!` is just to satisfy the type without a redundant runtime branch.
  const market = findMarket(symbol)!;

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
            contractType={tradeType}
            onContractTypeChange={setTradeType}
            accountMode={accountMode}
            accountBalance={accountBalance}
          />
        }
        main={
          <ChartPanel
            marketId={market.id}
            marketName={market.name}
            seedPrice={market.seedPrice}
            showStatsStrip={tradeType === "accumulators"}
            onSelectMarket={setSymbol}
          />
        }
        order={<OrderPanel contractType={tradeType} symbol={market.id} />}
      />
      {/* Positions drawer slides over from the icon sidebar's right edge */}
      <PositionsDrawer
        open={positionsOpen}
        onClose={() => setPositionsOpen(false)}
      />
    </>
  );
}
