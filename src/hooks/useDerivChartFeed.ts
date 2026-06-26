"use client";

import { useEffect, useRef } from "react";
import { derivWsUrl, type FeedStyle } from "@/services/deriv/derivSymbols";

export interface FeedTick {
  /** Epoch seconds (lightweight-charts UTCTimestamp). */
  time: number;
  value: number;
}

export interface FeedCandle {
  /** Candle open time, epoch seconds. */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type FeedStatus = "idle" | "connecting" | "open" | "closed" | "error";

export interface FeedCallbacks {
  /** Initial tick window (style="ticks"). */
  onSeedTicks?: (ticks: FeedTick[]) => void;
  /** One new tick (style="ticks"). */
  onTick?: (tick: FeedTick) => void;
  /** Initial candle window (style="candles"). */
  onSeedCandles?: (candles: FeedCandle[]) => void;
  /** The currently-forming candle, updated repeatedly (style="candles"). */
  onCandle?: (candle: FeedCandle) => void;
  /** Connection lifecycle + error surfacing. */
  onStatus?: (status: FeedStatus, detail?: string) => void;
}

interface FeedParams extends FeedCallbacks {
  /** Deriv symbol code, e.g. "1HZ100V". Undefined → don't connect. */
  derivSymbol: string | undefined;
  style: FeedStyle;
  /** Candle width in seconds (required when style="candles"). */
  granularity?: number;
  /** Default true. */
  enabled?: boolean;
}

const PING_INTERVAL_MS = 30_000;
const SEED_COUNT = 1000;
const RECONNECT_DELAY_MS = 2_000;

/**
 * Native HTML5 WebSocket client for one Deriv market-data subscription.
 *
 * Owns a single connection per (symbol, style, granularity) tuple, held in a
 * ref so high-frequency tick traffic never touches React's render path — the
 * data flows out through the callbacks, which the chart component wires
 * straight to its lightweight-charts series.
 *
 * Lifecycle (all in one effect, re-run when the tuple changes):
 *   open → subscribe (ticks_history) → stream → on unmount/param-change:
 *   forget_all + close. A `cancelled` guard drops any in-flight messages from
 *   a superseded socket (race-condition prevention when the user rapidly
 *   flips symbol/interval). Auto-reconnects with a fixed backoff on an
 *   unexpected close.
 */
export function useDerivChartFeed({
  derivSymbol,
  style,
  granularity,
  enabled = true,
  ...callbacks
}: FeedParams): void {
  // Keep callbacks in a ref so they don't widen the effect's dep list — we
  // only want to re-subscribe when the actual subscription tuple changes.
  const cbRef = useRef<FeedCallbacks>(callbacks);
  cbRef.current = callbacks;

  useEffect(() => {
    if (!enabled || !derivSymbol) {
      cbRef.current.onStatus?.("idle");
      return;
    }

    let cancelled = false;
    let ws: WebSocket | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let subscriptionId: string | null = null;

    const subscribeMsg =
      style === "candles"
        ? {
            ticks_history: derivSymbol,
            end: "latest",
            count: SEED_COUNT,
            style: "candles",
            granularity,
            subscribe: 1,
          }
        : {
            ticks_history: derivSymbol,
            end: "latest",
            count: SEED_COUNT,
            style: "ticks",
            subscribe: 1,
          };

    const connect = () => {
      if (cancelled) return;
      cbRef.current.onStatus?.("connecting");
      ws = new WebSocket(derivWsUrl());

      ws.onopen = () => {
        if (cancelled) return;
        cbRef.current.onStatus?.("open");
        ws?.send(JSON.stringify(subscribeMsg));
        pingTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ ping: 1 }));
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        let msg: DerivMessage;
        try {
          msg = JSON.parse(event.data as string);
        } catch {
          return;
        }
        if (msg.subscription?.id) subscriptionId = msg.subscription.id;

        if (msg.error) {
          cbRef.current.onStatus?.("error", msg.error.message);
          return;
        }

        switch (msg.msg_type) {
          case "history": {
            const { times, prices } = msg.history ?? {};
            if (times && prices) {
              const seeded: FeedTick[] = times.map((t, i) => ({
                time: Number(t),
                value: Number(prices[i]),
              }));
              cbRef.current.onSeedTicks?.(seeded);
            }
            break;
          }
          case "tick": {
            if (msg.tick) {
              cbRef.current.onTick?.({
                time: Number(msg.tick.epoch),
                value: Number(msg.tick.quote),
              });
            }
            break;
          }
          case "candles": {
            if (msg.candles) {
              cbRef.current.onSeedCandles?.(
                msg.candles.map((c) => ({
                  time: Number(c.epoch),
                  open: Number(c.open),
                  high: Number(c.high),
                  low: Number(c.low),
                  close: Number(c.close),
                })),
              );
            }
            break;
          }
          case "ohlc": {
            const o = msg.ohlc;
            if (o) {
              // The forming candle's bucket time is `open_time`, NOT `epoch`
              // (epoch is the latest tick inside the bucket).
              cbRef.current.onCandle?.({
                time: Number(o.open_time),
                open: Number(o.open),
                high: Number(o.high),
                low: Number(o.low),
                close: Number(o.close),
              });
            }
            break;
          }
        }
      };

      ws.onerror = () => {
        if (!cancelled) cbRef.current.onStatus?.("error", "WebSocket error");
      };

      ws.onclose = () => {
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = null;
        if (cancelled) return;
        cbRef.current.onStatus?.("closed");
        // Unexpected drop — retry after a fixed backoff.
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (pingTimer) clearInterval(pingTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Politely drop the server-side subscription before closing.
        try {
          if (subscriptionId) {
            ws.send(JSON.stringify({ forget: subscriptionId }));
          } else {
            ws.send(JSON.stringify({ forget_all: style }));
          }
        } catch {
          /* socket already gone — nothing to forget */
        }
      }
      ws?.close();
    };
  }, [derivSymbol, style, granularity, enabled]);
}

// ─── Deriv wire types (only the fields we read) ──────────────────────────────

interface DerivMessage {
  msg_type?: "history" | "tick" | "candles" | "ohlc" | string;
  error?: { code: string; message: string };
  subscription?: { id: string };
  history?: { times: (number | string)[]; prices: (number | string)[] };
  tick?: { epoch: number | string; quote: number | string; id?: string };
  candles?: Array<{
    epoch: number | string;
    open: number | string;
    high: number | string;
    low: number | string;
    close: number | string;
  }>;
  ohlc?: {
    open_time: number | string;
    epoch: number | string;
    open: number | string;
    high: number | string;
    low: number | string;
    close: number | string;
  };
}
