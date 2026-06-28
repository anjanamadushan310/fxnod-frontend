"use client";

import { create } from "zustand";

/**
 * Cross-cutting open/close state for the Positions drawer.
 *
 * Lives in a store (not page state) because both the IconSidebar toggle AND a
 * trade buy (deep in the order panel) need to open it — see usePanelBuy.
 */
interface PositionsUIState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const usePositionsUI = create<PositionsUIState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
