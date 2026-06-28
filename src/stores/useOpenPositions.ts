"use client";

import { create } from "zustand";
import type { Position } from "@/hooks/useMockPositions";

/**
 * Open-positions list shown in the Positions drawer.
 *
 * A successful trade (usePanelBuy → placeTrade.onSuccess) appends the real
 * position here from the backend response + current UI state. The per-tick P/L
 * `drift` is still a placeholder — it'll be replaced by the live
 * proposal_open_contract WebSocket stream when that lands. Same `Position`
 * shape as the eventual real hook, so PositionCard is unchanged.
 */
interface OpenPositionsState {
  positions: Position[];
  /** Append a new open position (id + starting P/L are filled in). */
  add: (p: Omit<Position, "id" | "pnl">) => void;
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
  tick: () =>
    set((s) => ({
      positions: s.positions.map((p) => ({
        ...p,
        pnl: +(p.pnl + (Math.random() - 0.5) * 0.1).toFixed(2),
      })),
    })),
  clear: () => set({ positions: [] }),
}));
