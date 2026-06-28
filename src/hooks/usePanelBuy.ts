"use client";

import { useState } from "react";
import { toast } from "sonner";
import { usePlaceTrade } from "@/services/api/endpoints/trading/trading";
import { findMarket } from "@/components/options/market/catalog";
import { useLiveMarket } from "@/stores/useLiveMarket";
import { usePositionsUI } from "@/stores/usePositionsUI";
import { useSimPositions } from "@/stores/useSimPositions";
import { useTradeOverlays } from "@/stores/useTradeOverlays";
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
  const { linked } = useDerivStatus();

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

  // TEMP (sim phase): relaxed so the simulated buy flow is testable without a
  // linked account / live quote. Restore `!!proposal && !quoting && linked`
  // once the real position lifecycle is wired from the Go backend.
  const canBuy = request !== null && isIdle && !pending;

  const payoutLabel = quoting
    ? "Fetching payout…"
    : proposal
      ? `Payout  ${Number(proposal.payout_amount).toFixed(2)} ${proposal.currency}`
      : null;

  const errorMsg =
    (placeTrade.error ? detailOf(placeTrade.error) : null) ?? quoteError;

  function handleBuy() {
    if (!request) return;
    // TEMP: simulate the full visual flow (drawer + position + chart overlay)
    // so we can validate placing a trade before backend order-execution WS.
    simulateTradeFlow(request);
    // Real single-shot execution still fires when a quote + linked account exist.
    if (linked && proposal) placeTrade.mutate({ data: request });
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

/**
 * TEMPORARY front-end simulation of a placed trade, for validating the visual
 * flow before the backend pushes the real position lifecycle:
 *   a) auto-open the Positions drawer,
 *   b) append a dummy open position,
 *   c) draw a barrier price line + entry/exit markers at the live price/time.
 */
function simulateTradeFlow(request: ProposalRequest) {
  const live = useLiveMarket.getState();
  const symbol = request.symbol;
  const side = request.side === "fall" ? "fall" : "rise";
  const stake = Number(request.stake) || 0;
  const price = live.price ?? 0;
  const now = Math.floor(Date.now() / 1000);

  usePositionsUI.getState().setOpen(true);

  useSimPositions.getState().add({
    marketId: symbol,
    marketName: live.marketName || findMarket(symbol)?.name || symbol,
    contractType: "rise_fall",
    side,
    status: "5 ticks",
    stake,
    contractValue: stake,
    entrySpot: price || undefined,
  });

  if (price > 0) {
    useTradeOverlays.getState().addOverlay({
      symbol,
      contractType: side,
      strikePrice: price,
      startTime: now,
      endTime: now + 5,
    });
  }
}

/** Pull the backend's human-readable `detail` off an axios error, if present. */
function detailOf(e: unknown): string | null {
  return (
    (e as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? null
  );
}
