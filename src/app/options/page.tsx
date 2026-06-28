"use client";

import { Suspense, useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { ChartPanel } from "@/components/options/chart/ChartPanel";
import { IconSidebar } from "@/components/options/layout/IconSidebar";
import { OptionsShell } from "@/components/options/layout/OptionsShell";
import { TopBar } from "@/components/options/layout/TopBar";
import { findMarket } from "@/components/options/market/catalog";
import { useChartSettings } from "@/hooks/useChartSettings";
import { OrderPanel } from "@/components/options/order/OrderPanel";
import { PositionsDrawer } from "@/components/options/positions/PositionsDrawer";
import { ContractDetailsModal } from "@/components/options/positions/ContractDetailsModal";
import { usePositionsUI } from "@/stores/usePositionsUI";
import { useOpenPositions } from "@/stores/useOpenPositions";
import { usePositionsWebSocket } from "@/hooks/usePositionsWebSocket";
import { useAuthStore } from "@/stores/authStore";
import type { OptionsAccountMode } from "@/components/options/layout/AccountSelector";

/**
 * Gate the positions WS behind a flag until the Go `/ws/positions` stream is
 * live — set NEXT_PUBLIC_POSITIONS_WS=1 to enable. Off → the drawer keeps using
 * the placeholder P/L drift.
 */
const POSITIONS_WS_ENABLED = process.env.NEXT_PUBLIC_POSITIONS_WS === "1";

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

/** Canonical default deep-link for a bare `/options` visit. */
const DEFAULT_OPTIONS_QUERY =
  "?chart_type=area&interval=1t&symbol=1HZ100V&trade_type=rise_fall";

function OptionsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Bare /options → pin the full default query so the URL is always explicit
  // and shareable. The guard (empty params only) means the post-replace render
  // — now with params — can't re-trigger it, so there's no redirect loop.
  useEffect(() => {
    if (searchParams.toString() === "") {
      router.replace(`/options${DEFAULT_OPTIONS_QUERY}` as Route, {
        scroll: false,
      });
    }
  }, [searchParams, router]);

  const [accountMode, _setAccountMode] = useState<OptionsAccountMode>("demo");

  // Drawer open state is a store (a buy can open it from the order panel).
  const positionsOpen = usePositionsUI((s) => s.open);
  const togglePositions = usePositionsUI((s) => s.toggle);
  const setPositionsOpen = usePositionsUI((s) => s.setOpen);
  const positionsCount = useOpenPositions((s) => s.positions.length);

  // Real-time P/L stream — runs whenever authenticated (needs the access token
  // for the WS handshake) and the feature flag is on.
  const authed = useAuthStore((s) => s.status === "authenticated");
  usePositionsWebSocket(POSITIONS_WS_ENABLED && authed);

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
        drawerOpen={positionsOpen}
        drawer={
          <PositionsDrawer
            open={positionsOpen}
            onClose={() => setPositionsOpen(false)}
          />
        }
        sidebar={
          <IconSidebar
            brandInitials="DT"
            theme="light"
            positionsOpen={positionsOpen}
            onPositionsToggle={togglePositions}
            positionsBadge={positionsCount || undefined}
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
      {/* Contract Details modal — self-portals into the options subtree (§10) */}
      <ContractDetailsModal />
    </>
  );
}
