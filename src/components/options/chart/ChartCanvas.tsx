"use client";

import { useMemo } from "react";
import type { PricePoint } from "@/hooks/usePriceSeries";
import {
  candleBucketSize,
  type ChartTypeId,
  type IntervalId,
} from "./chartSettings";

interface ChartCanvasProps {
  points: PricePoint[];
  /** Which renderer to use — comes from the URL (`?chart_type=`). */
  chartType: ChartTypeId;
  /** Active interval — drives candle bucketing (`?interval=`). */
  interval: IntervalId;
  /** Render a tick on the Y axis every N pixels (approx). */
  yTickPx?: number;
  /** Render a tick on the X axis every N minutes. */
  xTickEveryMs?: number;
  /** Pass-through for ChartPanel overlays (price tag etc). */
  children?: React.ReactNode;
}

/**
 * SVG chart renderer. No data subscription of its own — `points` is provided
 * by ChartPanel via `usePriceSeries`, and `chartType` / `interval` come from
 * the URL via `useChartSettings`. The render branch is chosen entirely by
 * those URL-derived props:
 *
 *   - "area"                  → filled line + area
 *   - "candle" / "hollow"     → candlesticks (filled / outlined-up)
 *   - "ohlc"                  → open/high/low/close bars
 *
 * Candle modes aggregate the raw tick stream into buckets sized by the
 * active interval (see `candleBucketSize`).
 *
 * Axes share a single logical viewBox so path coordinates are real pixels.
 */
export function ChartCanvas({
  points,
  chartType,
  interval,
  yTickPx = 28,
  xTickEveryMs = 2 * 60 * 1000,
  children,
}: ChartCanvasProps) {
  const geo = useMemo(() => buildGeometry(points), [points]);

  if (!geo) {
    return <div className="flex-1" />;
  }

  const isCandle =
    chartType === "candle" || chartType === "hollow" || chartType === "ohlc";

  return (
    <div className="relative flex-1 min-h-0">
      <svg
        viewBox={`0 0 ${geo.W} ${geo.H}`}
        preserveAspectRatio="none"
        className="block h-full w-full"
        // Don't rasterise — we want crisp lines on any DPR.
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--opt-ink)" stopOpacity="0.08" />
            <stop offset="1" stopColor="var(--opt-ink)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis horizontal gridlines + labels (right-aligned, Vela style) */}
        <YAxis
          minP={geo.minP}
          maxP={geo.maxP}
          W={geo.W}
          H={geo.H}
          tickPx={yTickPx}
        />

        {isCandle ? (
          <Candles
            points={points}
            geo={geo}
            chartType={chartType}
            interval={interval}
          />
        ) : (
          <AreaSeries points={points} geo={geo} />
        )}

        {/* Dashed horizontal line at the latest price (all modes) */}
        <line
          x1={0}
          x2={geo.W - 50}
          y1={geo.lastY}
          y2={geo.lastY}
          stroke="var(--opt-ink)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.4"
        />

        {/* X-axis time ticks under the chart */}
        <XAxis points={points} W={geo.W} H={geo.H} everyMs={xTickEveryMs} />
      </svg>

      {/* Overlay layer — CurrentPriceTag etc. positioned by ChartPanel */}
      <div className="pointer-events-none absolute inset-0">
        {children !== undefined ? children : null}
      </div>
    </div>
  );
}

// ─── geometry ──────────────────────────────────────────────────────────────

interface Geometry {
  W: number;
  H: number;
  minP: number;
  maxP: number;
  padTop: number;
  padRight: number;
  innerW: number;
  innerH: number;
  /** Map a bare time to a canvas X. */
  xOf: (t: number) => number;
  /** Map a bare price to a canvas Y. */
  yOf: (p: number) => number;
  /** Map a point to canvas pixels. */
  xy: (pt: PricePoint) => readonly [number, number];
  lastX: number;
  lastY: number;
}

function buildGeometry(points: PricePoint[]): Geometry | null {
  if (points.length < 2) return null;

  // Fixed logical viewBox; the SVG fills its host via preserveAspectRatio="none".
  // Reserve room on the right for Y-axis labels (56px) and a bottom strip (28px).
  const W = 1000;
  const H = 500;
  const padLeft = 0;
  const padRight = 56;
  const padTop = 12;
  const padBottom = 28;
  const innerW = W - padLeft - padRight;
  const innerH = H - padTop - padBottom;

  // Y bounds with a touch of padding so the series never grazes the edge.
  let minP = Infinity;
  let maxP = -Infinity;
  for (const pt of points) {
    if (pt.p < minP) minP = pt.p;
    if (pt.p > maxP) maxP = pt.p;
  }
  const range = Math.max(0.1, maxP - minP);
  minP -= range * 0.1;
  maxP += range * 0.1;

  const x0 = points[0]!.t;
  const xN = points[points.length - 1]!.t;
  const xSpan = Math.max(1, xN - x0);

  const xOf = (t: number) => padLeft + ((t - x0) / xSpan) * innerW;
  const yOf = (p: number) => padTop + ((maxP - p) / (maxP - minP)) * innerH;
  const xy = (pt: PricePoint) => [xOf(pt.t), yOf(pt.p)] as const;

  const last = points[points.length - 1]!;
  const [lastX, lastY] = xy(last);

  return {
    W,
    H,
    minP,
    maxP,
    padTop,
    padRight,
    innerW,
    innerH,
    xOf,
    yOf,
    xy,
    lastX,
    lastY,
  };
}

// ─── area renderer ─────────────────────────────────────────────────────────

function AreaSeries({
  points,
  geo,
}: {
  points: PricePoint[];
  geo: Geometry;
}) {
  const { linePath, areaPath } = useMemo(() => {
    let line = "";
    for (let i = 0; i < points.length; i++) {
      const [x, y] = geo.xy(points[i]!);
      line += i === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
    }
    const [firstX] = geo.xy(points[0]!);
    const baseY = geo.padTop + geo.innerH;
    const area = `${line} L${geo.lastX} ${baseY} L${firstX} ${baseY} Z`;
    return { linePath: line, areaPath: area };
  }, [points, geo]);

  return (
    <g>
      <path d={areaPath} fill="url(#area-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--opt-ink)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={geo.lastX} cy={geo.lastY} r="3" fill="var(--opt-ink)" />
    </g>
  );
}

// ─── candle / hollow / OHLC renderer ───────────────────────────────────────

interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

function buildCandles(points: PricePoint[], bucket: number): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i < points.length; i += bucket) {
    const end = Math.min(i + bucket, points.length);
    let high = -Infinity;
    let low = Infinity;
    for (let j = i; j < end; j++) {
      const p = points[j]!.p;
      if (p > high) high = p;
      if (p < low) low = p;
    }
    out.push({
      t: points[i]!.t,
      o: points[i]!.p,
      h: high,
      l: low,
      c: points[end - 1]!.p,
    });
  }
  return out;
}

function Candles({
  points,
  geo,
  chartType,
  interval,
}: {
  points: PricePoint[];
  geo: Geometry;
  chartType: ChartTypeId;
  interval: IntervalId;
}) {
  const candles = useMemo(
    () => buildCandles(points, candleBucketSize(interval)),
    [points, interval],
  );

  // Body half-width: a fraction of the average slot so candles don't touch.
  const slot = candles.length > 1 ? geo.innerW / candles.length : geo.innerW;
  const halfW = Math.max(1.5, Math.min(14, slot * 0.32));

  return (
    <g>
      {candles.map((cdl, i) => {
        const x = geo.xOf(cdl.t);
        const up = cdl.c >= cdl.o;
        const color = up ? "var(--opt-rise)" : "var(--opt-fall)";
        const yHigh = geo.yOf(cdl.h);
        const yLow = geo.yOf(cdl.l);

        if (chartType === "ohlc") {
          const yOpen = geo.yOf(cdl.o);
          const yClose = geo.yOf(cdl.c);
          return (
            <g key={i} stroke={color} strokeWidth="1.5" strokeLinecap="round">
              <line x1={x} x2={x} y1={yHigh} y2={yLow} />
              {/* open tick on the left, close tick on the right */}
              <line x1={x - halfW} x2={x} y1={yOpen} y2={yOpen} />
              <line x1={x} x2={x + halfW} y1={yClose} y2={yClose} />
            </g>
          );
        }

        // candle + hollow share the wick + body geometry
        const yOpen = geo.yOf(cdl.o);
        const yClose = geo.yOf(cdl.c);
        const bodyTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(1, Math.abs(yClose - yOpen));
        // Hollow: up candles are outlined; down candles filled.
        const hollowUp = chartType === "hollow" && up;

        return (
          <g key={i}>
            <line
              x1={x}
              x2={x}
              y1={yHigh}
              y2={yLow}
              stroke={color}
              strokeWidth="1"
            />
            <rect
              x={x - halfW}
              y={bodyTop}
              width={halfW * 2}
              height={bodyH}
              rx="0.5"
              fill={hollowUp ? "var(--opt-bg)" : color}
              stroke={color}
              strokeWidth="1"
            />
          </g>
        );
      })}
    </g>
  );
}

// ─── axes ──────────────────────────────────────────────────────────────────

function YAxis({
  minP,
  maxP,
  W,
  H,
  tickPx,
}: {
  minP: number;
  maxP: number;
  W: number;
  H: number;
  tickPx: number;
}) {
  const padRight = 56;
  const padTop = 12;
  const padBottom = 28;
  const innerH = H - padTop - padBottom;
  // Roughly one tick every `tickPx` of available height; scaled to viewBox.
  const tickCount = Math.max(3, Math.min(10, Math.round(innerH / (tickPx * (H / 360)))));
  const step = (maxP - minP) / tickCount;

  const labels: { y: number; v: number }[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const v = minP + step * i;
    const y = padTop + ((maxP - v) / (maxP - minP)) * innerH;
    labels.push({ y, v });
  }

  return (
    <g>
      {labels.map(({ y, v }, i) => (
        <g key={i}>
          <line
            x1={0}
            x2={W - padRight}
            y1={y}
            y2={y}
            stroke="var(--opt-line)"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            opacity="0.6"
          />
          <text
            x={W - 6}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fill="var(--opt-ink-3)"
          >
            {v.toFixed(2)}
          </text>
        </g>
      ))}
    </g>
  );
}

function XAxis({
  points,
  W,
  H,
  everyMs,
}: {
  points: PricePoint[];
  W: number;
  H: number;
  everyMs: number;
}) {
  const padBottom = 28;
  const padRight = 56;
  const innerW = W - padRight;
  const x0 = points[0]!.t;
  const xN = points[points.length - 1]!.t;
  const xSpan = Math.max(1, xN - x0);
  // Snap the first tick down to the nearest `everyMs`.
  const firstTick = Math.ceil(x0 / everyMs) * everyMs;

  const labels: { x: number; t: number }[] = [];
  for (let t = firstTick; t <= xN; t += everyMs) {
    const x = ((t - x0) / xSpan) * innerW;
    labels.push({ x, t });
  }

  return (
    <g transform={`translate(0, ${H - padBottom + 4})`}>
      {labels.map(({ x, t }, i) => (
        <text
          key={i}
          x={x}
          y={14}
          textAnchor="middle"
          fontSize="10.5"
          fontFamily="ui-monospace, monospace"
          fill="var(--opt-ink-3)"
        >
          {formatTime(t)}
        </text>
      ))}
    </g>
  );
}

function formatTime(ms: number) {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Re-exported helper so ChartPanel can compute the overlay top% for the
 * floating price tag without having to look at the geometry itself.
 */
export function topPercentForPrice(
  price: number,
  points: PricePoint[],
): number {
  const geo = buildGeometry(points);
  if (!geo) return 50;
  return (geo.yOf(price) / geo.H) * 100;
}
