"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { usePlaceTrade } from "@/services/api/endpoints/trading/trading";
import { findMarket } from "@/components/options/market/catalog";
import { useLiveMarket } from "@/stores/useLiveMarket";
import { useOpenPositions } from "@/stores/useOpenPositions";
import { usePositionsUI } from "@/stores/usePositionsUI";
import { useTradeOverlays } from "@/stores/useTradeOverlays";
import { useDerivStatus } from "./useDerivStatus";
import { useProposal } from "./useProposal";
import type { ConfirmResponse, ProposalRequest } from "@/services/tradingApi";

export type BuyPhase = "idle" | "buying" | "confirmed";

export interface PanelBuyResult {
  buyPhase: BuyPhase;
  lastTrade: ConfirmResponse | null;
  /** True when the account is linked and not mid-buy. */
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
 * Execution is the single-phase `usePlaceTrade` mutation (POST
 * /api/v1/orders/trade) — the payload is built from the current UI state
 * (symbol / stake / duration / contract type). The separate `useProposal`
 * quote stays only to show the live payout estimate on the button.
 *
 * Gating: Buy is disabled until the user has a linked Deriv account (the
 * status query is itself authenticated, so this also requires a session). On
 * success we open the Positions drawer, insert the real position, and draw
 * the barrier/entry overlay (see `applyPostTrade`).
 */
export function usePanelBuy(request: ProposalRequest | null): PanelBuyResult {
  const [lastTrade, setLastTrade] = useState<ConfirmResponse | null>(null);
  const { linked, isLoading: linkLoading } = useDerivStatus();

  const isIdle = lastTrade === null;

  // Always-current request for the async success handler (avoid stale closure).
  const requestRef = useRef(request);
  requestRef.current = request;

  // Quote is for display only (single-phase trade re-quotes server-side).
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
        if (requestRef.current) applyPostTrade(requestRef.current, trade);
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

  // Strictly require a linked (→ authenticated) account.
  const canBuy = request !== null && isIdle && linked && !pending;

  const payoutLabel = quoting
    ? "Fetching payout…"
    : proposal
      ? `Payout  ${Number(proposal.payout_amount).toFixed(2)} ${proposal.currency}`
      : null;

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

/**
 * Post-trade plumbing on a successful single-phase buy (§3): open the drawer,
 * insert the real position, and draw the barrier line + entry marker.
 *
 * NOTE: `ConfirmResponse` returns trade_id / buy_price / payout but NOT the
 * entry spot, barrier, or timestamps — so the chart anchors to the live price
 * captured at execution + `now`. Swap these for the response fields the moment
 * the backend includes them.
 */
function applyPostTrade(request: ProposalRequest, trade: ConfirmResponse) {
  const live = useLiveMarket.getState();
  const symbol = request.symbol;
  const side = request.side === "fall" ? "fall" : "rise";
  const stake = Number(request.stake) || Number(trade.buy_price) || 0;
  const entry = live.price ?? 0;
  const now = Math.floor(Date.now() / 1000);

  usePositionsUI.getState().setOpen(true);

  useOpenPositions.getState().add({
    marketId: symbol,
    marketName: live.marketName || findMarket(symbol)?.name || symbol,
    contractType: "rise_fall",
    side,
    status: durationLabel(request),
    stake,
    contractValue: Number(trade.buy_price) || stake,
    entrySpot: entry || undefined,
  });

  if (entry > 0) {
    useTradeOverlays.getState().addOverlay({
      symbol,
      contractType: side,
      strikePrice: entry,
      startTime: now,
      endTime: now + durationSeconds(request),
    });
  }
}

const UNIT_LABEL: Record<string, [string, string]> = {
  t: ["tick", "ticks"],
  s: ["sec", "secs"],
  m: ["min", "mins"],
  h: ["hour", "hours"],
  d: ["day", "days"],
};

function durationLabel(req: ProposalRequest): string {
  const n = req.duration;
  if (n == null) return "—";
  const [sg, pl] = UNIT_LABEL[req.duration_unit ?? "t"] ?? UNIT_LABEL.t!;
  return `${n} ${n === 1 ? sg : pl}`;
}

function durationSeconds(req: ProposalRequest): number {
  const n = req.duration ?? 5;
  switch (req.duration_unit) {
    case "s":
      return n;
    case "m":
      return n * 60;
    case "h":
      return n * 3600;
    case "d":
      return n * 86400;
    default:
      return n; // ticks ≈ 1s for 1s indices
  }
}

/** Pull the backend's human-readable `detail` off an axios error, if present. */
function detailOf(e: unknown): string | null {
  return (
    (e as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? null
  );
}
