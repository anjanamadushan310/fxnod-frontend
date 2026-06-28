/**
 * Wire contract for the Trading service positions WebSocket.
 *
 *   Endpoint : wss://api.fxnod.com/ws/positions?access_token=<jwt>
 *   Direction: server-push (the socket is per-user; the backend knows the user
 *              from the access_token query param and streams only their
 *              contracts — the client never sends a subscribe payload).
 *
 * Money / spot fields are DECIMAL STRINGS to preserve precision — the frontend
 * parses them to number only at the display boundary (the Position model).
 *
 * This file is the single source of truth for the JSON the Go backend emits.
 */

export type PositionStreamStatus = "open" | "won" | "lost";

/**
 * One contract's state. Live fields (status, profit, …) are sent on every
 * frame; the display/static fields are REQUIRED in `snapshot` frames (so the
 * client can rebuild cards after a reload) and OPTIONAL in incremental
 * `update` frames (where the contract is already known locally).
 */
export interface PositionFrame {
  /** Deriv contract id — correlation key with a local Position.contractId. */
  contract_id: string;

  // ── live (sent every frame) ───────────────────────────────────────────────
  status: PositionStreamStatus;
  /** Signed live P/L in the account currency, e.g. "1.23" / "-0.40". */
  profit: string;
  profit_percentage?: string;
  /** Current sellback value of the contract. */
  bid_price?: string;
  current_spot?: string;
  /** Elapsed / total ticks — drives the "Tick 3" style status label. */
  ticks_elapsed?: number;
  ticks_total?: number;
  updated_at?: number; // epoch seconds

  // ── display / static (required in `snapshot`, optional in `update`) ────────
  market_id?: string;
  market_name?: string;
  contract_type?: "rise_fall" | "accumulators" | "multipliers" | "turbos";
  side?: "rise" | "fall" | "up" | "down" | "accum";
  stake?: string;
  entry_spot?: string;
  barrier?: string;
  expiry_time?: number; // epoch seconds
}

/** Frames the server pushes to the client. */
export type PositionsServerMessage =
  /** Full set of OPEN contracts — sent on connect and on reconnect. */
  | { type: "snapshot"; data: PositionFrame[] }
  /** One contract's live fields changed (per tick). */
  | { type: "update"; data: PositionFrame }
  /** Terminal — contract settled; `data.status` is "won" | "lost". */
  | { type: "closed"; data: PositionFrame }
  /** Keepalive reply. */
  | { type: "pong" };

/** Messages the client sends (keepalive only). */
export type PositionsClientMessage = { type: "ping" };

/** Parse + minimally validate an inbound frame. Returns null on garbage. */
export function parsePositionsMessage(
  raw: string,
): PositionsServerMessage | null {
  try {
    const msg = JSON.parse(raw) as PositionsServerMessage;
    if (msg && typeof (msg as { type?: unknown }).type === "string") return msg;
  } catch {
    /* malformed frame — ignore */
  }
  return null;
}
