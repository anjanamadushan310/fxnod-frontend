"use client";

import { useEffect, useState } from "react";

export interface PricePoint {
  /** Epoch ms */
  t: number;
  /** Price */
  p: number;
}

export interface PriceSeries {
  /** Time-ordered points (oldest → newest). */
  points: PricePoint[];
  /** Most recent price. */
  latest: number;
  /** Price `windowSize` ticks ago — anchor for change/% display. */
  anchor: number;
  /** +1 = up, -1 = down, 0 = first tick / no change. */
  dir: -1 | 0 | 1;
  /** Re-increment each tick — useful as an effect dependency. */
  pulse: number;
}

interface Options {
  /** Starting (seed) price. */
  seed: number;
  /** Tick interval in ms. */
  intervalMs?: number;
  /** Rolling window length. */
  windowSize?: number;
  /** Enable / pause stream. */
  enabled?: boolean;
  /** Volatility multiplier — higher = wilder swings. */
  volatility?: number;
}

/**
 * Live-ticking rolling-window price stream.
 *
 * On mount we synthesise a back-history of `windowSize` ticks (so the chart
 * isn't empty on first paint). Each interval we append a new tick and drop
 * the oldest — pure FIFO, constant memory.
 *
 * Once the real Trading service WebSocket lands, swap the body of this hook;
 * the consumers (ChartCanvas, MarketPill, CurrentPriceTag) don't change.
 */
export function usePriceSeries({
  seed,
  intervalMs = 1000,
  windowSize = 120,
  enabled = true,
  volatility = 0.0015,
}: Options): PriceSeries {
  // Deterministic first render: an empty window with the (stable) seed price.
  // The random back-history is generated on mount in the effect below, NOT
  // during render — `buildInitialHistory` uses Math.random()/Date.now(), so
  // running it in render would produce different output on the server vs. the
  // client and trip a hydration mismatch (both the SVG path data and the
  // MarketPill price). Server + first client render now agree on this seed
  // state; ChartCanvas shows its empty placeholder until the effect fills it.
  const [state, setState] = useState<PriceSeries>(() => ({
    points: [],
    latest: seed,
    anchor: seed,
    dir: 0,
    pulse: 0,
  }));

  // Build the initial window on mount, and rebuild whenever the seed changes
  // (e.g. switching markets). Effects don't run during SSR, so this is the
  // first place randomness is allowed in.
  useEffect(() => {
    const fresh = buildInitialHistory(seed, windowSize, volatility);
    setState({
      points: fresh,
      latest: fresh[fresh.length - 1]!.p,
      anchor: fresh[0]!.p,
      dir: 0,
      pulse: 0,
    });
  }, [seed, windowSize, volatility]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setState((prev) => {
        const last = prev.points[prev.points.length - 1]!;
        const drift = (Math.random() - 0.5) * Math.max(0.4, last.p * volatility);
        const nextPrice = Math.max(0, last.p + drift);
        const sign = Math.sign(drift) as -1 | 0 | 1;
        const nextPoint: PricePoint = { t: Date.now(), p: nextPrice };

        // Slide the window (O(1) via shift; window is small).
        const points =
          prev.points.length >= windowSize
            ? [...prev.points.slice(1), nextPoint]
            : [...prev.points, nextPoint];

        return {
          points,
          latest: nextPrice,
          anchor: points[0]!.p,
          dir: sign,
          pulse: prev.pulse + 1,
        };
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, windowSize, volatility]);

  return state;
}

function buildInitialHistory(
  seed: number,
  size: number,
  volatility: number,
): PricePoint[] {
  // Walk backwards from `now` so the most recent tick is "now".
  const now = Date.now();
  const stepMs = 1000;
  const points: PricePoint[] = new Array(size);
  let price = seed;
  for (let i = 0; i < size; i++) {
    const drift = (Math.random() - 0.5) * Math.max(0.4, price * volatility);
    price = Math.max(0, price + drift);
    points[i] = { t: now - (size - i) * stepMs, p: price };
  }
  return points;
}
