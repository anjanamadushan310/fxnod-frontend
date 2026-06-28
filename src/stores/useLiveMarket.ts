"use client";

import { create } from "zustand";

/**
 * Latest streamed price for the on-screen market, published by ChartPanel.
 *
 * Read imperatively (`getState()`) by the order panel's buy handler so it can
 * anchor a simulated barrier/position to the live price without prop-drilling
 * from the chart subtree. Updated every tick — DON'T subscribe reactively to
 * `price` in render-heavy components.
 */
interface LiveMarketState {
  price: number | null;
  /** Catalog id of the on-screen market. */
  symbol: string;
  marketName: string;
  set: (patch: Partial<Omit<LiveMarketState, "set">>) => void;
}

export const useLiveMarket = create<LiveMarketState>((set) => ({
  price: null,
  symbol: "",
  marketName: "",
  set: (patch) => set(patch),
}));
