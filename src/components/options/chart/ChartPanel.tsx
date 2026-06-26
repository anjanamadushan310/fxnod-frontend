"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChartSettings } from "@/hooks/useChartSettings";
import { MarketPicker } from "../market/MarketPicker";
import { ChartFooter } from "./ChartFooter";
import { ChartTools } from "./ChartTools";
import { LiveChart } from "./LiveChart";
import { MarketPill } from "./MarketPill";
import { StatsStrip } from "./StatsStrip";

interface ChartPanelProps {
  /** Catalog id of the active market (e.g. "vol_100_1s"). */
  marketId: string;
  /** Display name e.g. "Volatility 100 (1s) Index". */
  marketName: string;
  /** Fallback price shown until the first live tick arrives. */
  seedPrice: number;
  /** Render the Accumulators stats strip between chart and footer. */
  showStatsStrip?: boolean;
  /** User picked a different market in the picker. */
  onSelectMarket: (id: string) => void;
}

/**
 * Chart column owner. Composes the market pill + picker, the tool strip, and
 * the live lightweight-charts canvas (LiveChart, which owns the Deriv
 * WebSocket subscription keyed by the URL's symbol/interval/chart_type).
 *
 * The only data this component lifts off the stream is the latest price, used
 * to keep the MarketPill (price + session change) in sync. Tick-by-tick chart
 * painting happens inside LiveChart via refs, off React's render path.
 */
export function ChartPanel({
  marketId,
  marketName,
  seedPrice,
  showStatsStrip = false,
  onSelectMarket,
}: ChartPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  // Chart type + interval are URL-driven (`?chart_type=…&interval=…`).
  const { chartType, interval, setChartType, setInterval } = useChartSettings();

  // Latest streamed price + the session anchor for the change indicator.
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const anchorRef = useRef<number | null>(null);

  // Reset the price readout when the market changes — the next stream seeds it.
  useEffect(() => {
    setLivePrice(null);
    anchorRef.current = null;
  }, [marketId]);

  const handlePrice = useCallback((price: number) => {
    if (anchorRef.current === null) anchorRef.current = price;
    setLivePrice(price);
  }, []);

  const price = livePrice ?? seedPrice;
  const anchor = anchorRef.current ?? seedPrice;
  const change = livePrice !== null ? +(price - anchor).toFixed(2) : 0;
  const changePct = anchor !== 0 ? (change / anchor) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0">
      {/* Market pill row — relative so the picker can anchor to it */}
      <div className="relative px-4 pt-3">
        <MarketPill
          name={marketName}
          price={price}
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

      {/* Chart body: [tools] [live canvas] */}
      <div className="relative grid flex-1 min-h-0 min-w-0 grid-cols-[44px_1fr] gap-0 px-3 pt-2">
        <ChartTools
          chartType={chartType}
          interval={interval}
          onChartTypeChange={setChartType}
          onIntervalChange={setInterval}
        />

        <LiveChart
          symbol={marketId}
          chartType={chartType}
          interval={interval}
          onPrice={handlePrice}
        />
      </div>

      {showStatsStrip && <StatsStrip />}

      <ChartFooter />
    </div>
  );
}
