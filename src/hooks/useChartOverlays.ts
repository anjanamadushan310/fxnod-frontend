"use client";

import { useEffect } from "react";
import {
  LineStyle,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";

import type {
  LiveChartHandle,
  PriceLineSpec,
} from "@/components/options/chart/LiveChart";
import { OVERLAY_COLORS, type TradeOverlay } from "@/stores/useTradeOverlays";

/**
 * Translates active trade overlays into chart primitives and pushes them onto
 * the LiveChart via its imperative handle:
 *   - one dashed barrier PRICE LINE at each strike (green Rise / red Fall)
 *   - an entry MARKER at start_time and an exit marker at end_time
 *
 * Re-applies whenever the overlay set changes. LiveChart re-attaches the last
 * applied lines/markers across series (chart-type) switches, so callers don't
 * have to reapply on every interaction.
 */
export function useChartOverlays(
  chartRef: React.RefObject<LiveChartHandle | null>,
  overlays: TradeOverlay[],
) {
  useEffect(() => {
    const handle = chartRef.current;
    if (!handle) return;

    const lines: PriceLineSpec[] = overlays.map((o) => ({
      price: o.strikePrice,
      color: o.contractType === "rise" ? OVERLAY_COLORS.rise : OVERLAY_COLORS.fall,
      title: o.contractType === "rise" ? "Rise" : "Fall",
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
    }));

    const markers: SeriesMarker<Time>[] = overlays
      .flatMap((o): SeriesMarker<Time>[] => {
        const color =
          o.contractType === "rise" ? OVERLAY_COLORS.rise : OVERLAY_COLORS.fall;
        return [
          {
            time: o.startTime as UTCTimestamp,
            position: o.contractType === "rise" ? "belowBar" : "aboveBar",
            color,
            shape: o.contractType === "rise" ? "arrowUp" : "arrowDown",
            text: "IN",
          },
          {
            time: o.endTime as UTCTimestamp,
            position: "aboveBar",
            color: OVERLAY_COLORS.exit,
            shape: "circle",
            text: "OUT",
          },
        ];
      })
      // lightweight-charts requires markers in ascending time order.
      .sort((a, b) => (a.time as number) - (b.time as number));

    handle.setPriceLines(lines);
    handle.setMarkers(markers);
  }, [chartRef, overlays]);
}
