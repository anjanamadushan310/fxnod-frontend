"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChartSettings } from "@/hooks/useChartSettings";
import { useChartOverlays } from "@/hooks/useChartOverlays";
import {
  useTradeOverlays,
  type OverlayContractType,
} from "@/stores/useTradeOverlays";
import { useLiveMarket } from "@/stores/useLiveMarket";
import { MarketPicker } from "../market/MarketPicker";
import { ChartFooter } from "./ChartFooter";
import { ChartToolbar, ChartNavControls } from "./ChartToolbar";
import { LiveChart, type LiveChartHandle } from "./LiveChart";
import { MarketPill } from "./MarketPill";
import { StatsStrip } from "./StatsStrip";

/** TEMP simulation: how far ahead the fake contract expires (seconds). */
const SIM_DURATION_SECONDS = 60;

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
  const { chartType, interval, tradeType, setChartType, setInterval } =
    useChartSettings();
  // Digit trade types restrict the chart interval to ticks (§4.2.2).
  const tickOnly =
    tradeType === "even_odd" ||
    tradeType === "matches_differs" ||
    tradeType === "over_under";

  // Latest streamed price + the session anchor for the change indicator.
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const anchorRef = useRef<number | null>(null);

  // ── Options overlays (barrier lines + entry/exit markers) ────────────────
  const chartRef = useRef<LiveChartHandle | null>(null);
  const allOverlays = useTradeOverlays((s) => s.overlays);
  const addOverlay = useTradeOverlays((s) => s.addOverlay);
  const clearSymbol = useTradeOverlays((s) => s.clearSymbol);
  // Only draw overlays belonging to the market currently on screen.
  const overlays = useMemo(
    () => allOverlays.filter((o) => o.symbol === marketId),
    [allOverlays, marketId],
  );
  useChartOverlays(chartRef, overlays);

  // TEMP: stand-in for real trade execution. Anchors the strike to the current
  // live price, start = now, end = now + SIM_DURATION_SECONDS.
  const simulateTrade = useCallback(
    (direction: OverlayContractType) => {
      const strike = livePrice;
      if (strike === null) return; // wait for the first live tick
      const now = Math.floor(Date.now() / 1000);
      addOverlay({
        symbol: marketId,
        contractType: direction,
        strikePrice: strike,
        startTime: now,
        endTime: now + SIM_DURATION_SECONDS,
      });
    },
    [addOverlay, livePrice, marketId],
  );

  // Reset the price readout when the market changes — the next stream seeds it.
  useEffect(() => {
    setLivePrice(null);
    anchorRef.current = null;
    // Publish the on-screen market id/name so the buy handler can anchor a
    // simulated barrier/position to it.
    useLiveMarket.getState().set({ symbol: marketId, marketName });
  }, [marketId, marketName]);

  const handlePrice = useCallback((price: number) => {
    if (anchorRef.current === null) anchorRef.current = price;
    setLivePrice(price);
    // Publish the latest price (read imperatively by the buy handler).
    useLiveMarket.getState().set({ price });
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

      {/* Chart body: [toolbar] [live canvas] */}
      <div className="relative grid flex-1 min-h-0 min-w-0 grid-cols-[44px_1fr] gap-0 px-3 pt-2">
        <ChartToolbar
          chartType={chartType}
          interval={interval}
          tickOnly={tickOnly}
          onChartTypeChange={setChartType}
          onIntervalChange={setInterval}
        />

        <LiveChart
          ref={chartRef}
          symbol={marketId}
          chartType={chartType}
          interval={interval}
          onPrice={handlePrice}
        />

        {/* Floating lower-left chart navigation controls (§4.4) */}
        <div className="pointer-events-none absolute bottom-4 left-[52px] z-10">
          <div className="pointer-events-auto">
            <ChartNavControls />
          </div>
        </div>
      </div>

      {/* TEMP: overlay simulation harness — remove once real trade execution
          populates useTradeOverlays on a successful buy. */}
      <SimulateOverlayBar
        disabled={livePrice === null}
        activeCount={overlays.length}
        onSimulate={simulateTrade}
        onClear={() => clearSymbol(marketId)}
      />

      {showStatsStrip && <StatsStrip />}

      <ChartFooter />
    </div>
  );
}

/**
 * TEMPORARY developer harness for the chart-overlay feature. Draws a simulated
 * Rise/Fall barrier + entry/exit markers using the current live price. Delete
 * this once real trade execution writes to useTradeOverlays.
 */
function SimulateOverlayBar({
  disabled,
  activeCount,
  onSimulate,
  onClear,
}: {
  disabled: boolean;
  activeCount: number;
  onSimulate: (direction: OverlayContractType) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-[12px]">
      <span className="font-semibold uppercase tracking-wide text-opt-ink-4">
        Sim
      </span>
      <button
        type="button"
        onClick={() => onSimulate("rise")}
        disabled={disabled}
        className="rounded-md px-2.5 py-1 font-semibold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: "#1eaf7b" }}
      >
        Simulate Rise
      </button>
      <button
        type="button"
        onClick={() => onSimulate("fall")}
        disabled={disabled}
        className="rounded-md px-2.5 py-1 font-semibold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: "#e0533d" }}
      >
        Simulate Fall
      </button>
      <button
        type="button"
        onClick={onClear}
        disabled={activeCount === 0}
        className="rounded-md bg-opt-bg-sunk px-2.5 py-1 font-medium text-opt-ink-2 transition-colors hover:text-opt-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        Clear{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
      {disabled && (
        <span className="text-opt-ink-4">waiting for live price…</span>
      )}
    </div>
  );
}
