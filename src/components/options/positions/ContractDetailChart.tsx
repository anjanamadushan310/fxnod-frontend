"use client";

import { useEffect, useRef } from "react";
import {
  ColorType,
  LineSeries,
  LineStyle,
  createChart,
  createSeriesMarkers,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import type { ContractDetail } from "./contractDetail";

/**
 * Right-panel chart of the Contract Details modal (Deriv §10): a second
 * lightweight-charts instance plotting just this contract's isolated tick
 * path. Each tick is a numbered node; the exit node is green (win) / red
 * (loss); the entry barrier is a dashed horizontal line.
 *
 * Theme colours are read from the scoped `--opt-*` vars (the modal portals
 * into the `[data-app="options"]` subtree, so they resolve).
 */
export function ContractDetailChart({ detail }: { detail: ContractDetail }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const css = (n: string) => getComputedStyle(el).getPropertyValue(n).trim();
    const ink = css("--opt-ink") || "#0a1430";
    const line = css("--opt-line") || "#e7e4dc";
    const inkFaint = css("--opt-ink-3") || "#7b8298";
    const rise = css("--opt-rise") || "#1eaf7b";
    const fall = css("--opt-fall") || "#e0533d";
    const exitColor = detail.outcome === "won" ? rise : fall;

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: inkFaint,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: line, style: 1 },
        horzLines: { color: line, style: 1 },
      },
      rightPriceScale: { borderColor: line },
      timeScale: { borderColor: line, timeVisible: true, secondsVisible: true },
    });

    const series = chart.addSeries(LineSeries, { color: ink, lineWidth: 2 });
    series.setData(
      detail.ticks.map((t) => ({ time: t.time as UTCTimestamp, value: t.value })),
    );

    // Entry barrier line (dashed).
    series.createPriceLine({
      price: detail.barrier,
      color: fall,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "Barrier",
    });

    // Numbered tick nodes; exit node coloured by outcome, entry node teal.
    const markers: SeriesMarker<Time>[] = detail.ticks.map((t, i) => ({
      time: t.time as UTCTimestamp,
      position: "aboveBar",
      color:
        t.kind === "exit" ? exitColor : t.kind === "entry" ? rise : inkFaint,
      shape: "circle",
      text: String(i + 1),
    }));
    createSeriesMarkers(series, markers);

    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]!.contentRect;
      if (width > 0 && height > 0) chart.resize(width, height);
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [detail]);

  return <div ref={containerRef} className="h-full w-full" />;
}
