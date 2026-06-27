"use client";

import { create } from "zustand";

/** Option direction that carries a barrier overlay. Extend as more types gain
 *  chart overlays (touch/no-touch barriers, accumulator bands, …). */
export type OverlayContractType = "rise" | "fall";

export interface TradeOverlay {
  /** Stable id for keying + removal. */
  id: string;
  /** Catalog id of the market this trade belongs to (e.g. "vol_100_1s"), so the
   *  chart only draws overlays for the symbol currently being viewed. */
  symbol: string;
  contractType: OverlayContractType;
  /** Barrier / strike price the horizontal line is drawn at. */
  strikePrice: number;
  /** Contract start — epoch SECONDS (lightweight-charts UTCTimestamp). */
  startTime: number;
  /** Contract expiry — epoch seconds. */
  endTime: number;
}

interface TradeOverlaysState {
  overlays: TradeOverlay[];
  /** Add an overlay; returns its generated id. */
  addOverlay: (overlay: Omit<TradeOverlay, "id">) => string;
  removeOverlay: (id: string) => void;
  /** Drop every overlay for one market. */
  clearSymbol: (symbol: string) => void;
  clearAll: () => void;
}

/**
 * Active trade overlays across all symbols. Consumers select + filter by the
 * market they're viewing. Real trade execution will populate this on a
 * successful buy; the temporary "Simulate" control writes to it for now.
 */
export const useTradeOverlays = create<TradeOverlaysState>((set) => ({
  overlays: [],
  addOverlay: (overlay) => {
    const id = crypto.randomUUID();
    set((s) => ({ overlays: [...s.overlays, { ...overlay, id }] }));
    return id;
  },
  removeOverlay: (id) =>
    set((s) => ({ overlays: s.overlays.filter((o) => o.id !== id) })),
  clearSymbol: (symbol) =>
    set((s) => ({ overlays: s.overlays.filter((o) => o.symbol !== symbol) })),
  clearAll: () => set({ overlays: [] }),
}));

/**
 * Hex colors used INSIDE the chart canvas. Tailwind classes don't apply to the
 * lightweight-charts canvas, so overlay colors must be literal hex. These match
 * the --opt-rise / --opt-fall design tokens.
 */
export const OVERLAY_COLORS = {
  rise: "#1eaf7b",
  fall: "#e0533d",
  exit: "#7b8298",
} as const;
