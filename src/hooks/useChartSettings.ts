"use client";

import { useCallback } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parseChartType,
  parseInterval,
  parseSymbol,
  parseTradeType,
  type ChartTypeId,
  type IntervalId,
  type TradeTypeId,
} from "@/components/options/chart/chartSettings";
import { fromDerivSymbol, toDerivSymbol } from "@/services/deriv/derivSymbols";

export interface ChartSettings {
  chartType: ChartTypeId;
  interval: IntervalId;
  /** Active market id (`?symbol=`), validated against the catalog. */
  symbol: string;
  /** Active contract type (`?trade_type=`), e.g. "rise_fall". */
  tradeType: TradeTypeId;
  setChartType: (id: ChartTypeId) => void;
  setInterval: (id: IntervalId) => void;
  setSymbol: (id: string) => void;
  setTradeType: (id: TradeTypeId) => void;
}

/**
 * URL-as-state for the chart UI.
 *
 * Reads `?chart_type=` and `?interval=` from the live query string and
 * exposes setters that push the change back into the URL with
 * `router.replace(..., { scroll: false })`. In the App Router this updates
 * the address bar and re-runs `useSearchParams()` subscribers **without a
 * full document reload** — it's a soft client-side navigation, so the chart
 * subscription and React tree stay mounted.
 *
 * We use `replace` (not `push`) so flipping chart type/interval doesn't spam
 * the browser back-stack with one entry per toggle.
 *
 * NOTE: any component calling this must sit under a <Suspense> boundary —
 * Next.js requires it for `useSearchParams()` (see app/options/page.tsx).
 */
export function useChartSettings(): ChartSettings {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chartType = parseChartType(searchParams.get("chart_type"));
  const interval = parseInterval(searchParams.get("interval"));
  // The URL carries the Deriv code (e.g. 1HZ100V); map it back to a catalog id
  // for internal use. Legacy catalog-id params still work (fromDerivSymbol → undefined).
  const rawSymbol = searchParams.get("symbol");
  const symbol = parseSymbol(fromDerivSymbol(rawSymbol) ?? rawSymbol);
  const tradeType = parseTradeType(searchParams.get("trade_type"));

  const update = useCallback(
    (patch: {
      chart_type?: ChartTypeId;
      interval?: IntervalId;
      symbol?: string;
      trade_type?: TradeTypeId;
    }) => {
      // Clone the *current* params so a write to one key never clobbers the
      // others — chart_type, interval, symbol and trade_type coexist in the
      // query string.
      const params = new URLSearchParams(searchParams.toString());
      if (patch.chart_type) params.set("chart_type", patch.chart_type);
      if (patch.interval) params.set("interval", patch.interval);
      if (patch.symbol) params.set("symbol", patch.symbol);
      if (patch.trade_type) params.set("trade_type", patch.trade_type);
      // `typedRoutes` only knows static hrefs; a runtime query string needs a
      // cast back to the Route brand.
      const href = `${pathname}?${params.toString()}` as Route;
      router.replace(href, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setChartType = useCallback(
    (id: ChartTypeId) => update({ chart_type: id }),
    [update],
  );
  const setInterval = useCallback(
    (id: IntervalId) => update({ interval: id }),
    [update],
  );
  const setSymbol = useCallback(
    // Store the Deriv code in the URL when we have one (keeps deep-links
    // Deriv-style); fall back to the catalog id for markets Deriv doesn't list.
    (id: string) => update({ symbol: toDerivSymbol(id) ?? id }),
    [update],
  );
  const setTradeType = useCallback(
    (id: TradeTypeId) => update({ trade_type: id }),
    [update],
  );

  return {
    chartType,
    interval,
    symbol,
    tradeType,
    setChartType,
    setInterval,
    setSymbol,
    setTradeType,
  };
}
