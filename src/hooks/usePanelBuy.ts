"use client";

import { useState } from "react";
import { toast } from "sonner";
import { usePlaceTrade } from "@/services/api/endpoints/trading/trading";
import { useDerivStatus } from "./useDerivStatus";
import { useProposal } from "./useProposal";
import type { ConfirmResponse, ProposalRequest } from "@/services/tradingApi";

export type BuyPhase = "idle" | "buying" | "confirmed";

export interface PanelBuyResult {
  buyPhase: BuyPhase;
  lastTrade: ConfirmResponse | null;
  /** True when a quote is ready, the account is linked, and not mid-buy. */
  canBuy: boolean;
  /** Sub-text for BuyButton — "Fetching payout…" while quoting, real value once ready, null when disabled. */
  payoutLabel: string | null;
  /** Gate hint (not linked) or the last quote/trade error. */
  errorMsg: string | null;
  handleBuy: () => void;
  handleNewTrade: () => void;
}

/**
 * Shared buy-state machine for all 10 order panels.
 *
 * Execution is the single-shot `usePlaceTrade` mutation (POST
 * /api/v1/orders/trade — proposal + immediate buy in one call). The separate
 * `useProposal` quote stays only to show the live payout estimate on the
 * button; it no longer performs the buy.
 *
 * Gating: the buy is disabled until the user has linked a Deriv account
 * (see `useDerivStatus`). The frontend never calls Deriv to trade — the order
 * flows through OUR Go backend.
 */
export function usePanelBuy(request: ProposalRequest | null): PanelBuyResult {
  const [lastTrade, setLastTrade] = useState<ConfirmResponse | null>(null);
  const { linked, isLoading: linkLoading } = useDerivStatus();

  const isIdle = lastTrade === null;

  // Quote is for display only now (single-shot trade re-quotes server-side).
  const { proposal, loading: quoting, error: quoteError } = useProposal(
    request,
    { enabled: isIdle },
  );

  const placeTrade = usePlaceTrade({
    mutation: {
      onSuccess: (trade) => {
        setLastTrade(trade);
        toast.success("Trade placed", {
          description: `Buy ${trade.buy_price} · payout ${trade.payout_amount} · #${trade.trade_id}`,
        });
      },
      onError: (e) => {
        toast.error("Trade failed", {
          description: detailOf(e) ?? "Please try again.",
        });
      },
    },
  });

  const pending = placeTrade.isPending;
  const buyPhase: BuyPhase = lastTrade
    ? "confirmed"
    : pending
      ? "buying"
      : "idle";

  const canBuy = !!proposal && !quoting && isIdle && linked && !pending;

  const payoutLabel = quoting
    ? "Fetching payout…"
    : proposal
      ? `Payout  ${Number(proposal.payout_amount).toFixed(2)} ${proposal.currency}`
      : null;

  // Show the link gate once the status query has resolved as "not linked".
  const gateMsg =
    !linkLoading && !linked
      ? "Connect your Deriv account to place trades."
      : null;
  const errorMsg =
    gateMsg ??
    (placeTrade.error ? detailOf(placeTrade.error) : null) ??
    quoteError;

  function handleBuy() {
    if (!request) return;
    if (!linked) {
      toast.error("Connect your Deriv account to place trades.");
      return;
    }
    placeTrade.mutate({ data: request });
  }

  function handleNewTrade() {
    setLastTrade(null);
    placeTrade.reset();
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

/** Pull the backend's human-readable `detail` off an axios error, if present. */
function detailOf(e: unknown): string | null {
  return (
    (e as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? null
  );
}
