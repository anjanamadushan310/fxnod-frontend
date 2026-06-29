"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  createSeriesMarkers,
  type AreaData,
  type CandlestickData,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type MouseEventParams,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import {
  useDerivChartFeed,
  type FeedCandle,
  type FeedStatus,
  type FeedTick,
} from "@/hooks/useDerivChartFeed";
import { feedPlan, toDerivSymbol } from "@/services/deriv/derivSymbols";
import {
  useChartDrawings,
  type Drawing,
  type DrawingTool,
} from "@/stores/useChartDrawings";
import { TrendPrimitive, VerticalPrimitive } from "./chartPrimitives";
import type { ChartTypeId, IntervalId } from "./chartSettings";

/** Accent color for user-drawn lines (drawn on canvas — needs literal hex). */
const DRAWING_COLOR = "#2962FF";

/** Live chart objects backing one Drawing, removed when the drawing is deleted. */
type DrawingObj =
  | { kind: "priceline"; line: IPriceLine }
  | { kind: "primitive"; primitive: TrendPrimitive | VerticalPrimitive };

interface LiveChartProps {
  /** Catalog id (e.g. "vol_100_1s") — mapped to a Deriv symbol internally. */
  symbol: string;
  chartType: ChartTypeId;
  interval: IntervalId;
  /** Lifts the latest streamed price so MarketPill can show it live. */
  onPrice?: (price: number) => void;
}

/** A horizontal barrier line (e.g. Rise/Fall entry, Touch/No-Touch barrier). */
export interface PriceLineSpec {
  price: number;
  color?: string;
  title?: string;
  /** 1–4. */
  lineWidth?: number;
  lineStyle?: LineStyle;
}

/**
 * Imperative handle for the future Options overlay layer. Lets ticket panels
 * draw/clear barrier lines and entry/exit markers without owning the chart.
 */
export interface LiveChartHandle {
  /** Replace all barrier lines. Survives chart-type (series) switches. */
  setPriceLines: (lines: PriceLineSpec[]) => void;
  clearPriceLines: () => void;
  /** Replace time-scale markers (entry/exit/settlement). */
  setMarkers: (markers: SeriesMarker<Time>[]) => void;
  getChart: () => IChartApi | null;
  getSeries: () =>
    | ISeriesApi<"Area">
    | ISeriesApi<"Candlestick">
    | null;
}

/**
 * Real-time chart backed by lightweight-charts + the Deriv WebSocket feed.
 *
 * The canvas chart, its series, and the data buffers all live in refs so the
 * tick stream bypasses React's render path entirely — only the connection
 * status (a rare event) is React state. The series type follows `chartType`
 * (area vs candlestick); the wire format follows `interval` (raw ticks vs
 * candles). Overlays (price lines + markers) are stored as specs and
 * re-applied whenever the series is recreated, so a chart-type switch never
 * drops the Options barriers an upstream ticket has drawn.
 */
export const LiveChart = forwardRef<LiveChartHandle, LiveChartProps>(
  function LiveChart({ symbol, chartType, interval, onPrice }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<
      ISeriesApi<"Area"> | ISeriesApi<"Candlestick"> | null
    >(null);

    // Data buffers — replaced on seed, mutated tail-only on update.
    const ticksRef = useRef<FeedTick[]>([]);
    const candlesRef = useRef<FeedCandle[]>([]);

    // Overlay state (specs persist across series recreation).
    const priceLineSpecsRef = useRef<PriceLineSpec[]>([]);
    const priceLineObjsRef = useRef<IPriceLine[]>([]);
    const markersRef = useRef<SeriesMarker<Time>[]>([]);
    const markersApiRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

    // Drawing tools: armed tool + this symbol's drawings (from the store), plus
    // the live chart objects backing them and the pending first trend-line click.
    const activeTool = useChartDrawings((s) => s.activeTool);
    const allDrawings = useChartDrawings((s) => s.drawings);
    const drawings = useMemo(
      () => allDrawings.filter((d) => d.symbol === symbol),
      [allDrawings, symbol],
    );
    const drawingsRef = useRef<Drawing[]>(drawings);
    drawingsRef.current = drawings;
    const activeToolRef = useRef<DrawingTool | null>(activeTool);
    activeToolRef.current = activeTool;
    const drawingObjsRef = useRef<Map<string, DrawingObj>>(new Map());
    const pendingTrendRef = useRef<{ time: Time; price: number } | null>(null);

    const [status, setStatus] = useState<FeedStatus>("idle");

    const derivSymbol = toDerivSymbol(symbol);
    const plan = feedPlan(chartType, interval);
    const seriesKind = plan.seriesKind;

    // ── Chart instance: created once, resized via ResizeObserver ────────────
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const css = (name: string) =>
        getComputedStyle(el).getPropertyValue(name).trim();
      const line = css("--opt-line") || "#e7e4dc";
      const inkFaint = css("--opt-ink-3") || "#7b8298";

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
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: line },
        timeScale: {
          borderColor: line,
          timeVisible: true,
          secondsVisible: false,
        },
      });
      chartRef.current = chart;

      // Keep the canvas matched to its flex container (mandated ResizeObserver).
      // Fires every frame while the drawer-compress grid transition runs, so
      // chart.resize() keeps the canvas in lock-step with the shrinking column.
      const ro = new ResizeObserver((entries) => {
        const { width, height } = entries[0]!.contentRect;
        if (width > 0 && height > 0) chart.resize(width, height);
      });
      ro.observe(el);

      return () => {
        ro.disconnect();
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
        markersApiRef.current = null;
        priceLineObjsRef.current = [];
        drawingObjsRef.current.clear();
      };
    }, []);

    // ── Series: (re)created when the kind changes; rehydrated + re-overlaid ──
    useEffect(() => {
      const chart = chartRef.current;
      const el = containerRef.current;
      if (!chart || !el) return;

      const css = (name: string) =>
        getComputedStyle(el).getPropertyValue(name).trim();
      const ink = css("--opt-ink") || "#0a1430";
      const rise = css("--opt-rise") || "#1eaf7b";
      const fall = css("--opt-fall") || "#e0533d";

      if (seriesRef.current) {
        chart.removeSeries(seriesRef.current);
        seriesRef.current = null;
        priceLineObjsRef.current = []; // died with the old series
        markersApiRef.current = null;
        drawingObjsRef.current.clear(); // price lines + primitives died too
      }

      if (seriesKind === "candlestick") {
        seriesRef.current = chart.addSeries(CandlestickSeries, {
          upColor: rise,
          downColor: fall,
          borderUpColor: rise,
          borderDownColor: fall,
          wickUpColor: rise,
          wickDownColor: fall,
        });
      } else {
        seriesRef.current = chart.addSeries(AreaSeries, {
          lineColor: ink,
          topColor: hexToRgba(ink, 0.18),
          bottomColor: hexToRgba(ink, 0),
          lineWidth: 2,
        });
      }

      hydrateSeries(
        seriesRef.current,
        seriesKind,
        ticksRef.current,
        candlesRef.current,
      );
      // Re-attach overlays to the fresh series.
      applyPriceLines(seriesRef.current, priceLineSpecsRef.current, priceLineObjsRef);
      markersApiRef.current = createSeriesMarkers(
        seriesRef.current,
        markersRef.current,
      );
      // Re-attach user drawings to the fresh series.
      applyDrawings(seriesRef.current, drawingsRef.current, drawingObjsRef);
      chart.timeScale().fitContent();
    }, [seriesKind]);

    // ── Drawing tools: cursor, click capture, and render sync ───────────────
    // Crosshair cursor while a tool is armed; clear a half-finished trend line
    // when the tool is disarmed.
    useEffect(() => {
      const el = containerRef.current;
      if (el) el.style.cursor = activeTool ? "crosshair" : "";
      if (!activeTool) pendingTrendRef.current = null;
    }, [activeTool]);

    // Subscribe to chart clicks once; the handler reads the armed tool from a
    // ref so it never goes stale. Horizontal → one click; vertical → one click;
    // trend → two clicks. Placing a drawing disarms the tool (one-shot).
    useEffect(() => {
      const chart = chartRef.current;
      if (!chart) return;
      const handler = (param: MouseEventParams) => {
        const tool = activeToolRef.current;
        const series = seriesRef.current;
        const point = param.point;
        if (!tool || !series || !point) return;

        const price = series.coordinateToPrice(point.y);
        const time = (param.time ??
          chart.timeScale().coordinateToTime(point.x)) as Time | null;
        const store = useChartDrawings.getState();

        if (tool === "horizontal") {
          if (price === null) return;
          store.addDrawing({ symbol, tool, color: DRAWING_COLOR, price: Number(price) });
          store.setActiveTool(null);
        } else if (tool === "vertical") {
          if (time === null) return;
          store.addDrawing({ symbol, tool, color: DRAWING_COLOR, time: Number(time) });
          store.setActiveTool(null);
        } else {
          // trend — first click anchors, second click completes.
          if (time === null || price === null) return;
          const pt = { time, price: Number(price) };
          if (!pendingTrendRef.current) {
            pendingTrendRef.current = pt;
            return;
          }
          const a = pendingTrendRef.current;
          store.addDrawing({
            symbol,
            tool,
            color: DRAWING_COLOR,
            points: [
              { time: Number(a.time), price: a.price },
              { time: Number(pt.time), price: pt.price },
            ],
          });
          pendingTrendRef.current = null;
          store.setActiveTool(null);
        }
      };
      chart.subscribeClick(handler);
      return () => chart.unsubscribeClick(handler);
    }, [symbol]);

    // Re-render drawings whenever the store set for this symbol changes.
    useEffect(() => {
      if (seriesRef.current) {
        applyDrawings(seriesRef.current, drawings, drawingObjsRef);
      }
    }, [drawings]);

    // ── Live feed — pushes straight into the series via refs ────────────────
    useDerivChartFeed({
      derivSymbol,
      style: plan.style,
      granularity: plan.granularity,
      enabled: Boolean(derivSymbol),
      onStatus: setStatus,
      onSeedTicks: (ticks) => {
        ticksRef.current = ticks;
        if (seriesKind === "area") {
          (seriesRef.current as ISeriesApi<"Area"> | null)?.setData(
            toAreaData(ticks),
          );
          chartRef.current?.timeScale().fitContent();
        }
        const last = ticks[ticks.length - 1];
        if (last) onPrice?.(last.value);
      },
      onTick: (tick) => {
        pushTick(ticksRef.current, tick);
        if (seriesKind === "area") {
          try {
            (seriesRef.current as ISeriesApi<"Area"> | null)?.update({
              time: tick.time as UTCTimestamp,
              value: tick.value,
            });
          } catch {
            /* out-of-order tick — ignore */
          }
        }
        onPrice?.(tick.value);
      },
      onSeedCandles: (candles) => {
        candlesRef.current = candles;
        ticksRef.current = candles.map((c) => ({
          time: c.time,
          value: c.close,
        }));
        hydrateSeries(seriesRef.current, seriesKind, ticksRef.current, candles);
        chartRef.current?.timeScale().fitContent();
        const last = candles[candles.length - 1];
        if (last) onPrice?.(last.close);
      },
      onCandle: (candle) => {
        upsertCandle(candlesRef.current, candle);
        try {
          if (seriesKind === "candlestick") {
            (seriesRef.current as ISeriesApi<"Candlestick"> | null)?.update(
              toCandleDatum(candle),
            );
          } else {
            (seriesRef.current as ISeriesApi<"Area"> | null)?.update({
              time: candle.time as UTCTimestamp,
              value: candle.close,
            });
          }
        } catch {
          /* out-of-order candle — ignore */
        }
        onPrice?.(candle.close);
      },
    });

    // ── Imperative overlay API for the future Options layer ─────────────────
    useImperativeHandle(
      ref,
      (): LiveChartHandle => ({
        setPriceLines: (lines) => {
          priceLineSpecsRef.current = lines;
          if (seriesRef.current) {
            applyPriceLines(seriesRef.current, lines, priceLineObjsRef);
          }
        },
        clearPriceLines: () => {
          priceLineSpecsRef.current = [];
          if (seriesRef.current) {
            applyPriceLines(seriesRef.current, [], priceLineObjsRef);
          }
        },
        setMarkers: (markers) => {
          markersRef.current = markers;
          markersApiRef.current?.setMarkers(markers);
        },
        getChart: () => chartRef.current,
        getSeries: () => seriesRef.current,
      }),
      [],
    );

    return (
      <div className="relative h-full w-full min-h-0">
        <div ref={containerRef} className="absolute inset-0" />
        <FeedStatusBadge status={status} unsupported={!derivSymbol} />
      </div>
    );
  },
);

// ─── status overlay ──────────────────────────────────────────────────────────

function FeedStatusBadge({
  status,
  unsupported,
}: {
  status: FeedStatus;
  unsupported: boolean;
}) {
  if (unsupported) {
    return (
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-opt-bg-sunk px-3 py-1.5 text-[12px] text-opt-ink-3">
        This market isn’t available on the live feed yet.
      </div>
    );
  }
  if (status === "open" || status === "idle") return null;
  const label =
    status === "connecting"
      ? "Connecting to live feed…"
      : status === "closed"
        ? "Reconnecting…"
        : "Live feed error";
  return (
    <div className="pointer-events-none absolute right-3 top-2 rounded-full bg-opt-bg-sunk px-2.5 py-1 text-[11px] font-medium text-opt-ink-3">
      {label}
    </div>
  );
}

// ─── overlay helpers ─────────────────────────────────────────────────────────

/** Remove any existing price lines on `series`, then draw `specs` afresh. */
function applyPriceLines(
  series: ISeriesApi<"Area"> | ISeriesApi<"Candlestick">,
  specs: PriceLineSpec[],
  objsRef: React.MutableRefObject<IPriceLine[]>,
) {
  for (const line of objsRef.current) {
    try {
      series.removePriceLine(line);
    } catch {
      /* series may have been recreated — safe to ignore */
    }
  }
  objsRef.current = specs.map((spec) =>
    series.createPriceLine({
      price: spec.price,
      color: spec.color ?? "#7b8298",
      lineWidth: (spec.lineWidth ?? 1) as 1 | 2 | 3 | 4,
      lineStyle: spec.lineStyle ?? LineStyle.Dashed,
      axisLabelVisible: true,
      title: spec.title ?? "",
    }),
  );
}

/** Tear down every tracked drawing on `series`, then (re)create from `drawings`.
 *  Horizontal → built-in price line; trend/vertical → v5 series primitives. */
function applyDrawings(
  series: ISeriesApi<"Area"> | ISeriesApi<"Candlestick">,
  drawings: Drawing[],
  objsRef: React.MutableRefObject<Map<string, DrawingObj>>,
) {
  for (const obj of objsRef.current.values()) {
    try {
      if (obj.kind === "priceline") series.removePriceLine(obj.line);
      else series.detachPrimitive(obj.primitive);
    } catch {
      /* series may have been recreated — safe to ignore */
    }
  }
  objsRef.current.clear();

  for (const d of drawings) {
    if (d.tool === "horizontal" && d.price != null) {
      const line = series.createPriceLine({
        price: d.price,
        color: d.color,
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: "",
      });
      objsRef.current.set(d.id, { kind: "priceline", line });
    } else if (d.tool === "vertical" && d.time != null) {
      const primitive = new VerticalPrimitive(d.time as Time, d.color);
      series.attachPrimitive(primitive);
      objsRef.current.set(d.id, { kind: "primitive", primitive });
    } else if (d.tool === "trend" && d.points) {
      const [p1, p2] = d.points;
      const primitive = new TrendPrimitive(
        { time: p1.time as Time, price: p1.price },
        { time: p2.time as Time, price: p2.price },
        d.color,
      );
      series.attachPrimitive(primitive);
      objsRef.current.set(d.id, { kind: "primitive", primitive });
    }
  }
}

// ─── data helpers ────────────────────────────────────────────────────────────

const MAX_POINTS = 1500;

/** Drop non-ascending points; collapse equal timestamps to the latest. */
function ascending<T extends { time: number }>(arr: T[]): T[] {
  const out: T[] = [];
  for (const it of arr) {
    const last = out[out.length - 1];
    if (last && it.time < last.time) continue;
    if (last && it.time === last.time) {
      out[out.length - 1] = it;
      continue;
    }
    out.push(it);
  }
  return out;
}

function toAreaData(ticks: FeedTick[]): AreaData[] {
  return ascending(ticks).map((t) => ({
    time: t.time as UTCTimestamp,
    value: t.value,
  }));
}

function toCandleData(candles: FeedCandle[]): CandlestickData[] {
  return ascending(candles).map(toCandleDatum);
}

function toCandleDatum(c: FeedCandle): CandlestickData {
  return {
    time: c.time as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  };
}

function hydrateSeries(
  series: ISeriesApi<"Area"> | ISeriesApi<"Candlestick"> | null,
  kind: "area" | "candlestick",
  ticks: FeedTick[],
  candles: FeedCandle[],
) {
  if (!series) return;
  if (kind === "candlestick") {
    (series as ISeriesApi<"Candlestick">).setData(toCandleData(candles));
  } else {
    (series as ISeriesApi<"Area">).setData(toAreaData(ticks));
  }
}

/** Append a tick, replacing the tail if the second repeats; cap the buffer. */
function pushTick(buf: FeedTick[], tick: FeedTick) {
  const last = buf[buf.length - 1];
  if (last && tick.time === last.time) buf[buf.length - 1] = tick;
  else if (!last || tick.time > last.time) buf.push(tick);
  if (buf.length > MAX_POINTS) buf.splice(0, buf.length - MAX_POINTS);
}

/** Update the forming candle in place, or append a new bucket. */
function upsertCandle(buf: FeedCandle[], candle: FeedCandle) {
  const last = buf[buf.length - 1];
  if (last && candle.time === last.time) buf[buf.length - 1] = candle;
  else if (!last || candle.time > last.time) buf.push(candle);
  if (buf.length > MAX_POINTS) buf.splice(0, buf.length - MAX_POINTS);
}

/** "#rrggbb" → "rgba(r,g,b,a)". Falls back to the input for non-hex. */
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1]!, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
