"use client";

import { useState } from "react";
import { usePriceSeries } from "@/hooks/usePriceSeries";
import { MarketPicker } from "../market/MarketPicker";
import { ChartCanvas, topPercentForPrice } from "./ChartCanvas";
import { ChartFooter } from "./ChartFooter";
import { ChartTools } from "./ChartTools";
import { ChartZoomControls } from "./ChartZoomControls";
import { CurrentPriceTag } from "./CurrentPriceTag";
import { MarketPill } from "./MarketPill";
import { StatsStrip } from "./StatsStrip";

interface ChartPanelProps {
  /** Catalog id of the active market (e.g. "vol_100_1s"). */
  marketId: string;
  /** Display name e.g. "Volatility 100 (1s) Index". */
  marketName: string;
  /** Seed price for the simulator. Real-world: comes from initial REST snapshot. */
  seedPrice: number;
  /** How fast the simulator ticks; real impl ignores this. */
  intervalMs?: number;
  /** Render the Accumulators stats strip between chart and footer. */
  showStatsStrip?: boolean;
  /** User picked a different market in the picker. */
  onSelectMarket: (id: string) => void;
}

/**
 * Single owner of the `usePriceSeries` subscription.
 *
 * Distributes:
 *   - `points`  → ChartCanvas (re-paints every tick, expected)
 *   - `latest`, `change`, `pct` → MarketPill (memo-able)
 *   - `latest`, `topPct` → CurrentPriceTag (React.memo'd already)
 *
 * Also owns the MarketPicker open/close flag — the picker is a portal-style
 * popover anchored to the MarketPill. Toggling it doesn't perturb the chart
 * subscription because both live in this component's subtree.
 */
export function ChartPanel({
  marketId,
  marketName,
  seedPrice,
  intervalMs = 1000,
  showStatsStrip = false,
  onSelectMarket,
}: ChartPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { points, latest, anchor, dir } = usePriceSeries({
    seed: seedPrice,
    intervalMs,
    windowSize: 120,
  });

  const change = +(latest - anchor).toFixed(2);
  const changePct = anchor !== 0 ? (change / anchor) * 100 : 0;
  const trend: "rise" | "fall" | null =
    dir > 0 ? "rise" : dir < 0 ? "fall" : null;

  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0">
      {/* Market pill row — relative so the picker can anchor to it */}
      <div className="relative px-4 pt-3">
        <MarketPill
          name={marketName}
          price={latest}
          change={change}
          changePct={changePct}
          onOpen={() => setPickerOpen((v) => !v)}
        />
        {pickerOpen && (
          <MarketPicker
            activeMarketId={marketId}
            onSelectMarket={(id) => {
              onSelectMarket(id);
              setPickerOpen(false);
            }}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>

      {/* Chart body: [tools] [canvas] */}
      <div className="relative grid flex-1 min-h-0 min-w-0 grid-cols-[44px_1fr] gap-0 px-3 pt-2">
        <ChartTools />

        <ChartCanvas points={points}>
          <CurrentPriceTag
            price={latest}
            topPercent={topPercentForPrice(latest, points)}
            trend={trend}
          />
        </ChartCanvas>

        {/* Floating zoom cluster (absolute, bottom-left over the canvas) */}
        <div className="absolute bottom-12 left-4">
          <ChartZoomControls />
        </div>
      </div>

      {showStatsStrip && <StatsStrip />}

      <ChartFooter />
    </div>
  );
}
