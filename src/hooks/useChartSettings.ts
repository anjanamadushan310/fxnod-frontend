"use client";

import { useCallback } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parseChartType,
  parseInterval,
  parseSymbol,
  type ChartTypeId,
  type IntervalId,
} from "@/components/options/chart/chartSettings";

export interface ChartSettings {
  chartType: ChartTypeId;
  interval: IntervalId;
  /** Active market id (`?symbol=`), validated against the catalog. */
  symbol: string;
  setChartType: (id: ChartTypeId) => void;
  setInterval: (id: IntervalId) => void;
  setSymbol: (id: string) => void;
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
  const symbol = parseSymbol(searchParams.get("symbol"));

  const update = useCallback(
    (patch: {
      chart_type?: ChartTypeId;
      interval?: IntervalId;
      symbol?: string;
    }) => {
      // Clone the *current* params so a write to one key never clobbers the
      // others — chart_type, interval and symbol coexist in the query string.
      const params = new URLSearchParams(searchParams.toString());
      if (patch.chart_type) params.set("chart_type", patch.chart_type);
      if (patch.interval) params.set("interval", patch.interval);
      if (patch.symbol) params.set("symbol", patch.symbol);
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
    (id: string) => update({ symbol: id }),
    [update],
  );

  return { chartType, interval, symbol, setChartType, setInterval, setSymbol };
}
