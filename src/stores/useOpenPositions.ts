"use client";

import { create } from "zustand";
import type { Position } from "@/hooks/useMockPositions";
import type { PositionFrame } from "@/services/positionsStream";

/**
 * Open-positions list shown in the Positions drawer.
 *
 * A successful trade (usePanelBuy → placeTrade.onSuccess) appends the real
 * position here from the backend response + current UI state, carrying the
 * Deriv `contractId`. Live P/L + status are then merged from the positions
 * WebSocket stream (usePositionsWebSocket) via applySnapshot / applyUpdate /
 * markClosed, matched on `contractId`.
 *
 * `tick()` is the legacy random-drift placeholder — remove it (and the
 * PositionsDrawer interval) once the WS stream is the source of P/L.
 */
interface OpenPositionsState {
  positions: Position[];
  /** Append a new open position (id + starting P/L are filled in). */
  add: (p: Omit<Position, "id" | "pnl">) => void;
  /** Upsert one contract's live fields from a stream frame. */
  applyUpdate: (frame: PositionFrame) => void;
  /** Reconcile the full open set from a snapshot frame (upsert, non-destructive). */
  applySnapshot: (frames: PositionFrame[]) => void;
  /** Mark a contract settled (won/lost + final P/L). */
  markClosed: (frame: PositionFrame) => void;
  /** Drift every position's P/L (placeholder until the positions WS stream). */
  tick: () => void;
  clear: () => void;
}

export const useOpenPositions = create<OpenPositionsState>((set) => ({
  positions: [],
  add: (p) =>
    set((s) => ({
      positions: [
        { ...p, id: crypto.randomUUID(), pnl: 0 } as Position,
        ...s.positions,
      ],
    })),
  applyUpdate: (frame) =>
    set((s) => ({ positions: upsert(s.positions, frame) })),
  applySnapshot: (frames) =>
    set((s) => ({ positions: frames.reduce(upsert, s.positions) })),
  markClosed: (frame) =>
    set((s) => ({
      positions: s.positions.map((p) =>
        p.contractId === frame.contract_id ? { ...p, ...framePatch(frame) } : p,
      ),
    })),
  tick: () =>
    set((s) => ({
      positions: s.positions.map((p) => ({
        ...p,
        pnl: +(p.pnl + (Math.random() - 0.5) * 0.1).toFixed(2),
      })),
    })),
  clear: () => set({ positions: [] }),
}));

// ─── stream → Position mapping ───────────────────────────────────────────────

/** Upsert a frame into the list: patch the matching contract, else create it
 *  (only when the frame carries enough display context — i.e. a snapshot). */
function upsert(list: Position[], frame: PositionFrame): Position[] {
  const idx = list.findIndex((p) => p.contractId === frame.contract_id);
  if (idx === -1) {
    if (!frame.market_id && !frame.market_name && frame.stake == null) {
      return list; // bare incremental update for an unknown contract — skip
    }
    return [frameToPosition(frame), ...list];
  }
  const next = list.slice();
  next[idx] = { ...next[idx]!, ...framePatch(frame) };
  return next;
}

/** Live fields to merge onto an existing position. */
function framePatch(frame: PositionFrame): Partial<Position> {
  const patch: Partial<Position> = {
    pnl: toNum(frame.profit) ?? 0,
    outcome:
      frame.status === "won" || frame.status === "lost" ? frame.status : null,
  };
  const value = toNum(frame.bid_price);
  if (value !== undefined) patch.contractValue = value;
  const entry = toNum(frame.entry_spot);
  if (entry !== undefined) patch.entrySpot = entry;
  if (frame.barrier !== undefined) patch.barrier = frame.barrier;
  const label = statusLabel(frame);
  if (label) patch.status = label;
  return patch;
}

/** Build a full Position from a snapshot frame (post-reload rehydration). */
function frameToPosition(frame: PositionFrame): Position {
  const stake = toNum(frame.stake) ?? 0;
  return {
    id: crypto.randomUUID(),
    contractId: frame.contract_id,
    marketId: frame.market_id ?? "",
    marketName: frame.market_name ?? frame.market_id ?? "",
    contractType: frame.contract_type ?? "rise_fall",
    side: frame.side ?? "rise",
    status: statusLabel(frame),
    stake,
    contractValue: toNum(frame.bid_price) ?? stake,
    entrySpot: toNum(frame.entry_spot),
    barrier: frame.barrier,
    pnl: toNum(frame.profit) ?? 0,
    outcome:
      frame.status === "won" || frame.status === "lost" ? frame.status : null,
  };
}

/** "Tick 3" / "3/5 ticks" display sub-label, when the backend sends tick counts. */
function statusLabel(frame: PositionFrame): string | undefined {
  if (frame.ticks_elapsed != null && frame.ticks_total != null) {
    return `${frame.ticks_elapsed}/${frame.ticks_total} ticks`;
  }
  if (frame.ticks_elapsed != null) return `Tick ${frame.ticks_elapsed}`;
  return undefined;
}

/** Parse a decimal string to number at the display boundary; undefined if absent. */
function toNum(v: string | undefined): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
