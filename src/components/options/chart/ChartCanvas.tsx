"use client";

import { useMemo } from "react";
import type { PricePoint } from "@/hooks/usePriceSeries";
import { cn } from "@/lib/cn";

interface ChartCanvasProps {
  points: PricePoint[];
  /** Render a tick on the Y axis every N pixels (approx). */
  yTickPx?: number;
  /** Render a tick on the X axis every N minutes. */
  xTickEveryMs?: number;
  /** Pass-through for ChartPanel overlays (price tag etc). */
  children?: React.ReactNode;
}

/**
 * Pure SVG line+area chart. No data subscription of its own — `points`
 * is provided by ChartPanel via `usePriceSeries`. The component is
 * deliberately stateless so:
 *
 *   - It can be rendered server-side from a static snapshot
 *   - Memoising it is a single React.memo away (we keep it raw here
 *     because it does re-render every tick, by design)
 *
 * Axes are drawn inside the same SVG using a 1:1 viewBox so the path
 * coordinates are real pixels — no math gymnastics in render.
 */
export function ChartCanvas({
  points,
  yTickPx = 28,
  xTickEveryMs = 2 * 60 * 1000,
  children,
}: ChartCanvasProps) {
  const view = useMemo(() => buildViewModel(points), [points]);

  if (!view) {
    return <div className="flex-1" />;
  }

  return (
    <div className="relative flex-1 min-h-0">
      <svg
        viewBox={`0 0 ${view.W} ${view.H}`}
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
          minP={view.minP}
          maxP={view.maxP}
          W={view.W}
          H={view.H}
          tickPx={yTickPx}
        />

        {/* Filled area under the line */}
        <path d={view.areaPath} fill="url(#area-fill)" />

        {/* The line itself */}
        <path
          d={view.linePath}
          fill="none"
          stroke="var(--opt-ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Tiny dot on the most recent point */}
        <circle
          cx={view.lastX}
          cy={view.lastY}
          r="3"
          fill="var(--opt-ink)"
        />

        {/* Dashed horizontal line at the latest price */}
        <line
          x1={view.lastX}
          x2={view.W - 50}
          y1={view.lastY}
          y2={view.lastY}
          stroke="var(--opt-ink)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.4"
        />

        {/* X-axis time ticks under the chart */}
        <XAxis points={points} W={view.W} H={view.H} everyMs={xTickEveryMs} />
      </svg>

      {/* Overlay layer — CurrentPriceTag etc. positioned by ChartPanel */}
      <div className="pointer-events-none absolute inset-0">
        {children !== undefined ? children : null}
      </div>
    </div>
  );
}

// ─── view-model + axes ─────────────────────────────────────────────────────

interface ViewModel {
  W: number;
  H: number;
  minP: number;
  maxP: number;
  linePath: string;
  areaPath: string;
  lastX: number;
  lastY: number;
  /** Y position of the latest price in 0–100% (used by overlays). */
  lastTopPct: number;
}

function buildViewModel(points: PricePoint[]): ViewModel | null {
  if (points.length < 2) return null;

  // Fixed logical viewBox; the SVG fills its host via preserveAspectRatio="none".
  // We reserve room on the right for the Y-axis labels (50px) and a small bottom strip (28px).
  const W = 1000;
  const H = 500;
  const padLeft = 0;
  const padRight = 56;
  const padTop = 12;
  const padBottom = 28;
  const innerW = W - padLeft - padRight;
  const innerH = H - padTop - padBottom;

  // Compute Y bounds with a touch of padding so the line never grazes the edge.
  let minP = Infinity;
  let maxP = -Infinity;
  for (const pt of points) {
    if (pt.p < minP) minP = pt.p;
    if (pt.p > maxP) maxP = pt.p;
  }
  const range = Math.max(0.1, maxP - minP);
  minP -= range * 0.1;
  maxP += range * 0.1;

  // Map a single point to (x, y) inside the inner rect.
  const x0 = points[0]!.t;
  const xN = points[points.length - 1]!.t;
  const xSpan = Math.max(1, xN - x0);
  const xy = (pt: PricePoint) => {
    const x = padLeft + ((pt.t - x0) / xSpan) * innerW;
    const y = padTop + ((maxP - pt.p) / (maxP - minP)) * innerH;
    return [x, y] as const;
  };

  // Build the line + area paths in a single pass.
  let linePath = "";
  for (let i = 0; i < points.length; i++) {
    const [x, y] = xy(points[i]!);
    linePath += i === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
  }
  const [firstX] = xy(points[0]!);
  const [lastX, lastY] = xy(points[points.length - 1]!);
  const baseY = padTop + innerH;
  const areaPath = `${linePath} L${lastX} ${baseY} L${firstX} ${baseY} Z`;

  const lastTopPct = ((lastY - padTop) / innerH) * 100 * (innerH / H) + (padTop / H) * 100;

  return {
    W,
    H,
    minP,
    maxP,
    linePath,
    areaPath,
    lastX,
    lastY,
    lastTopPct,
  };
}

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
  const padTop = 12;
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
 * floating price tag without having to look at the view model itself.
 */
export function topPercentForPrice(
  price: number,
  points: PricePoint[],
): number {
  const view = buildViewModel(points);
  if (!view) return 50;
  const innerY = ((view.maxP - price) / (view.maxP - view.minP)) * (view.H - 40) + 12;
  return (innerY / view.H) * 100;
}

export { type ViewModel as _ViewModel };
