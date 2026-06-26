"use client";

import { useEffect, useRef } from "react";
import {
  useDerivWebSocket,
  type DerivMessage,
  type DerivSocketStatus,
} from "./useDerivWebSocket";
import type { FeedStyle } from "@/services/deriv/derivSymbols";

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

/** Re-exported so consumers keep one import for the status union. */
export type FeedStatus = DerivSocketStatus;

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

const SEED_COUNT = 1000;

/**
 * Market-data subscription layer on top of {@link useDerivWebSocket}.
 *
 * Translates the URL-derived (symbol, style, granularity) tuple into a single
 * `ticks_history` subscription and fans the resulting Deriv frames out to
 * chart-friendly callbacks. The underlying socket is shared and *persists*
 * across symbol/interval changes — switching just `forget`s the old
 * subscription and opens a new one (no reconnect churn).
 */
export function useDerivChartFeed({
  derivSymbol,
  style,
  granularity,
  enabled = true,
  ...callbacks
}: FeedParams): void {
  // Callbacks in a ref so they don't widen the subscription effect's deps.
  const cbRef = useRef<FeedCallbacks>(callbacks);
  cbRef.current = callbacks;

  const active = enabled && Boolean(derivSymbol);
  const { status, subscribe } = useDerivWebSocket(active);

  // Surface connection status.
  useEffect(() => {
    cbRef.current.onStatus?.(status);
  }, [status]);

  // (Re)subscribe whenever the data tuple changes.
  useEffect(() => {
    if (!active || !derivSymbol) return;

    const payload: Record<string, unknown> =
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

    const unsubscribe = subscribe(payload, (msg) =>
      routeFrame(msg, cbRef.current),
    );
    return unsubscribe;
  }, [subscribe, active, derivSymbol, style, granularity]);
}

/** Map one Deriv frame to the appropriate chart callback. */
function routeFrame(raw: DerivMessage, cb: FeedCallbacks) {
  const msg = raw as DerivWireMessage;

  if (msg.error) {
    cb.onStatus?.("error", msg.error.message);
    return;
  }

  switch (msg.msg_type) {
    case "history": {
      const { times, prices } = msg.history ?? {};
      if (times && prices) {
        cb.onSeedTicks?.(
          times.map((t, i) => ({ time: Number(t), value: Number(prices[i]) })),
        );
      }
      break;
    }
    case "tick": {
      if (msg.tick) {
        cb.onTick?.({
          time: Number(msg.tick.epoch),
          value: Number(msg.tick.quote),
        });
      }
      break;
    }
    case "candles": {
      if (msg.candles) {
        cb.onSeedCandles?.(
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
        // The forming candle's bucket time is `open_time` (epoch is the latest
        // tick inside the bucket).
        cb.onCandle?.({
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
}

// ─── Deriv wire payloads (only the fields we read) ───────────────────────────

interface DerivWireMessage extends DerivMessage {
  history?: { times: (number | string)[]; prices: (number | string)[] };
  tick?: { epoch: number | string; quote: number | string };
  candles?: Array<{
    epoch: number | string;
    open: number | string;
    high: number | string;
    low: number | string;
    close: number | string;
  }>;
  ohlc?: {
    open_time: number | string;
    open: number | string;
    high: number | string;
    low: number | string;
    close: number | string;
  };
}
