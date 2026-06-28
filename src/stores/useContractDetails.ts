"use client";

import { create } from "zustand";
import type { ContractDetail } from "@/components/options/positions/contractDetail";

/**
 * Which contract's details modal is open (Deriv §10). Set from a position
 * card's expand (⇗); read by the page-level ContractDetailsModal.
 */
interface ContractDetailsState {
  detail: ContractDetail | null;
  open: (detail: ContractDetail) => void;
  close: () => void;
}

export const useContractDetails = create<ContractDetailsState>((set) => ({
  detail: null,
  open: (detail) => set({ detail }),
  close: () => set({ detail: null }),
}));
