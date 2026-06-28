"use client";

import { create } from "zustand";
import type { Position } from "@/hooks/useMockPositions";

/**
 * Mutable open-positions list for the TEMPORARY simulated-buy flow.
 *
 * Stands in for the real Trading-service positions stream: a buy appends a
 * position here (usePanelBuy), the drawer renders them and drifts their P/L.
 * Same `Position` shape as the eventual real hook, so PositionCard is unchanged.
 */
interface SimPositionsState {
  positions: Position[];
  /** Append a new open position (id + starting P/L are filled in). */
  add: (p: Omit<Position, "id" | "pnl">) => void;
  /** Drift every position's P/L a touch (called on an interval by the drawer). */
  tick: () => void;
  clear: () => void;
}

export const useSimPositions = create<SimPositionsState>((set) => ({
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
