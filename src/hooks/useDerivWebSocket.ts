"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { derivWsUrl } from "@/services/deriv/derivSymbols";

export type DerivSocketStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";

/** Minimal shape of a Deriv frame — enough to route + forget. Detailed payload
 *  parsing is the subscription layer's job. */
export interface DerivMessage {
  msg_type?: string;
  req_id?: number;
  error?: { code: string; message: string };
  subscription?: { id: string };
  [key: string]: unknown;
}

export interface DerivSocketApi {
  status: DerivSocketStatus;
  /**
   * Send a Deriv subscription request (e.g. ticks_history … subscribe:1) and
   * route every matching frame to `onMessage`. Returns an unsubscribe fn that
   * `forget`s the server-side subscription and stops routing.
   */
  subscribe: (
    payload: Record<string, unknown>,
    onMessage: (msg: DerivMessage) => void,
  ) => () => void;
}

interface ActiveSub {
  reqId: number;
  payload: Record<string, unknown>;
  onMessage: (msg: DerivMessage) => void;
  /** Server-assigned subscription id, captured from the first frame. */
  serverId: string | null;
}

const PING_INTERVAL_MS = 30_000;
const MAX_BACKOFF_MS = 30_000;

/**
 * Robust single-connection manager for the Deriv WebSocket API.
 *
 * Responsibilities (and ONLY these — message parsing lives a layer up):
 *   - Owns one WebSocket in a ref; exposes a React `status`.
 *   - 30s ping keep-alive.
 *   - Exponential-backoff auto-reconnect, capped at 30s.
 *   - Multiplexes N subscriptions over the one socket via a per-sub `req_id`
 *     (Deriv echoes `req_id` on stream frames), and **replays all active
 *     subscriptions on reconnect** so a dropped socket self-heals.
 *   - Precise teardown: `forget <subscription_id>` per unsubscribe, and a
 *     `forget_all` safety net on unmount.
 *
 * A `cancelled` ref guards against stale frames from a socket that's being
 * torn down (race-condition prevention when `enabled` flips).
 */
export function useDerivWebSocket(enabled = true): DerivSocketApi {
  const wsRef = useRef<WebSocket | null>(null);
  const subsRef = useRef<Map<number, ActiveSub>>(new Map());
  const reqIdRef = useRef(1);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const cancelledRef = useRef(false);
  const [status, setStatus] = useState<DerivSocketStatus>("idle");

  const send = useCallback((obj: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }, []);

  const sendSubscribe = useCallback(
    (sub: ActiveSub) => send({ ...sub.payload, req_id: sub.reqId }),
    [send],
  );

  // `connect` is held in a ref so the reconnect timer always calls the latest
  // closure (which captures the current send/sendSubscribe).
  const connectRef = useRef<() => void>(() => {});
  connectRef.current = () => {
    if (cancelledRef.current) return;
    setStatus("connecting");
    const ws = new WebSocket(derivWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      if (cancelledRef.current) return;
      attemptsRef.current = 0;
      setStatus("open");
      // Replay every still-active subscription (fresh connection has none).
      subsRef.current.forEach((sub) => {
        sub.serverId = null;
        sendSubscribe(sub);
      });
      pingRef.current = setInterval(() => send({ ping: 1 }), PING_INTERVAL_MS);
    };

    ws.onmessage = (event) => {
      if (cancelledRef.current) return;
      let msg: DerivMessage;
      try {
        msg = JSON.parse(event.data as string);
      } catch {
        return;
      }
      if (msg.msg_type === "ping") return;

      const reqId = msg.req_id;
      if (typeof reqId !== "number") return;
      const sub = subsRef.current.get(reqId);
      if (!sub) return;

      const serverId = extractSubscriptionId(msg);
      if (serverId) sub.serverId = serverId;
      sub.onMessage(msg);
    };

    ws.onerror = () => {
      if (!cancelledRef.current) setStatus("error");
    };

    ws.onclose = () => {
      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }
      if (cancelledRef.current) return;
      setStatus("closed");
      const delay = Math.min(MAX_BACKOFF_MS, 2 ** attemptsRef.current * 1000);
      attemptsRef.current += 1;
      reconnectRef.current = setTimeout(() => connectRef.current(), delay);
    };
  };

  // Lifecycle: open on mount / when enabled; tear down on unmount / disable.
  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    cancelledRef.current = false;
    connectRef.current();

    return () => {
      cancelledRef.current = true;
      if (pingRef.current) clearInterval(pingRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          send({ forget_all: ["ticks", "candles"] });
        } catch {
          /* socket already closing */
        }
      }
      ws?.close();
      wsRef.current = null;
      subsRef.current.clear();
    };
  }, [enabled, send]);

  const subscribe = useCallback<DerivSocketApi["subscribe"]>(
    (payload, onMessage) => {
      const reqId = reqIdRef.current++;
      const sub: ActiveSub = { reqId, payload, onMessage, serverId: null };
      subsRef.current.set(reqId, sub);
      // Open already? fire now. Otherwise the onopen replay will send it.
      if (wsRef.current?.readyState === WebSocket.OPEN) sendSubscribe(sub);

      return () => {
        const existing = subsRef.current.get(reqId);
        subsRef.current.delete(reqId);
        if (existing?.serverId && wsRef.current?.readyState === WebSocket.OPEN) {
          send({ forget: existing.serverId });
        }
      };
    },
    [send, sendSubscribe],
  );

  return { status, subscribe };
}

/** Pull the forgettable subscription id out of whichever frame carries it. */
function extractSubscriptionId(msg: DerivMessage): string | null {
  if (msg.subscription && typeof msg.subscription.id === "string") {
    return msg.subscription.id;
  }
  const tick = msg.tick as { id?: string } | undefined;
  if (tick?.id) return tick.id;
  const ohlc = msg.ohlc as { id?: string } | undefined;
  if (ohlc?.id) return ohlc.id;
  return null;
}
