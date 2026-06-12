"use client";

import { useState } from "react";
import { useProposal } from "./useProposal";
import type { ConfirmResponse, ProposalRequest } from "@/services/tradingApi";

export type BuyPhase = "idle" | "buying" | "confirmed";

export interface PanelBuyResult {
  buyPhase: BuyPhase;
  lastTrade: ConfirmResponse | null;
  /** True when a proposal is ready and the panel is not mid-buy. */
  canBuy: boolean;
  /** Sub-text for BuyButton — "Fetching payout…" while quoting, real value once ready, null when disabled. */
  payoutLabel: string | null;
  /** Last error from either the quote fetch or confirm call. */
  errorMsg: string | null;
  handleBuy: () => Promise<void>;
  handleNewTrade: () => void;
}

/**
 * Shared buy-state machine for all 10 order panels.
 *
 * Wires useProposal (paused during buying/confirmed) + confirm() + error
 * handling into a single hook so each panel stays focused on its own inputs.
 */
export function usePanelBuy(request: ProposalRequest | null): PanelBuyResult {
  const [buyPhase, setBuyPhase] = useState<BuyPhase>("idle");
  const [buyError, setBuyError] = useState<string | null>(null);
  const [lastTrade, setLastTrade] = useState<ConfirmResponse | null>(null);

  const isIdle = buyPhase === "idle";

  const {
    proposal,
    loading: quoting,
    error: quoteError,
    confirm,
  } = useProposal(request, { enabled: isIdle });

  const canBuy = !!proposal && !quoting && isIdle;

  const payoutLabel = quoting
    ? "Fetching payout…"
    : proposal
      ? `Payout  ${Number(proposal.payout_amount).toFixed(2)} ${proposal.currency}`
      : null;

  const errorMsg = buyError ?? quoteError;

  async function handleBuy() {
    setBuyPhase("buying");
    setBuyError(null);
    try {
      const result = await confirm();
      setLastTrade(result);
      setBuyPhase("confirmed");
    } catch (e) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setBuyError(detail ?? "Trade failed. Please try again.");
      setBuyPhase("idle");
    }
  }

  function handleNewTrade() {
    setLastTrade(null);
    setBuyError(null);
    setBuyPhase("idle");
  }

  return {
    buyPhase,
    lastTrade,
    canBuy,
    payoutLabel,
    errorMsg,
    handleBuy,
    handleNewTrade,
  };
}
