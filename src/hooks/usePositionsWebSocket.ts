"use client";

import { useEffect, useRef, useState } from "react";
import { parsePositionsMessage } from "@/services/positionsStream";
import { buildWsUrl } from "@/services/ws";
import { useOpenPositions } from "@/stores/useOpenPositions";

export type PositionsSocketStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";

const PING_INTERVAL_MS = 30_000;
const MAX_BACKOFF_MS = 30_000;

/**
 * Subscribes to the Trading service's per-user positions stream and merges live
 * P/L + status into the useOpenPositions store.
 *
 *   wss://api.fxnod.com/ws/positions?access_token=<jwt>
 *
 * The socket is authenticated by the access_token query param (browsers can't
 * set WS auth headers). Server-push only — the backend re-sends a `snapshot` on
 * connect, so a dropped socket self-heals after reconnect. Auto-reconnects with
 * capped exponential backoff and a 30s app-level ping.
 *
 * Mounted once (gated by `enabled`) high in the options tree so P/L stays live
 * even while the Positions drawer is closed.
 */
export function usePositionsWebSocket(enabled = true): PositionsSocketStatus {
  const [status, setStatus] = useState<PositionsSocketStatus>("idle");
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const cancelledRef = useRef(false);

  // Held in a ref so the reconnect timer always calls the latest closure.
  const connectRef = useRef<() => void>(() => {});
  connectRef.current = () => {
    if (cancelledRef.current) return;
    setStatus("connecting");
    // buildWsUrl appends the current access_token, so reconnects pick up a
    // refreshed token automatically.
    const ws = new WebSocket(buildWsUrl("/ws/positions"));
    wsRef.current = ws;

    ws.onopen = () => {
      if (cancelledRef.current) return;
      attemptsRef.current = 0;
      setStatus("open");
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, PING_INTERVAL_MS);
    };

    ws.onmessage = (event) => {
      if (cancelledRef.current) return;
      const msg = parsePositionsMessage(event.data as string);
      if (!msg) return;
      const store = useOpenPositions.getState();
      switch (msg.type) {
        case "snapshot":
          store.applySnapshot(msg.data);
          break;
        case "update":
          store.applyUpdate(msg.data);
          break;
        case "closed":
          store.markClosed(msg.data);
          break;
        case "pong":
          break;
      }
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
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled]);

  return status;
}
