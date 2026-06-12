"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ordersApi,
  type ConfirmResponse,
  type ProposalRequest,
  type ProposalResponse,
} from "@/services/tradingApi";

interface UseProposalOptions {
  debounceMs?: number;
  enabled?: boolean;
}

interface UseProposalResult {
  proposal: ProposalResponse | null;
  loading: boolean;
  /** Last error message (validation 422, no-account 428, Deriv 502, …). */
  error: string | null;
  /** Execute the latest proposal. Re-quotes + retries once on a 410. */
  confirm: () => Promise<ConfirmResponse>;
}

/**
 * Debounced one-shot proposal fetcher (V1 — a WS price stream is V2).
 *
 * Each time `request` changes (after `debounceMs`) we fetch a fresh binding
 * quote. Stale responses are dropped via a sequence guard so fast input
 * changes can't show an out-of-order payout.
 *
 * `confirm()` buys the most recent proposal. If the 5s TTL lapsed (HTTP 410)
 * it transparently re-quotes once and retries — matching the slippage design.
 */
export function useProposal(
  request: ProposalRequest | null,
  { debounceMs = 400, enabled = true }: UseProposalOptions = {},
): UseProposalResult {
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Monotonic guard so only the newest in-flight request can commit state.
  const seqRef = useRef(0);
  // Always-current snapshot for confirm()/re-quote without stale closures.
  const requestRef = useRef<ProposalRequest | null>(request);
  const proposalRef = useRef<ProposalResponse | null>(null);
  requestRef.current = request;
  proposalRef.current = proposal;

  const key = request ? JSON.stringify(request) : null;

  useEffect(() => {
    if (!enabled || !request) {
      setProposal(null);
      return;
    }
    const seq = ++seqRef.current;
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ordersApi.proposal(request);
        if (seq === seqRef.current) setProposal(res);
      } catch (e) {
        if (seq === seqRef.current) {
          setProposal(null);
          setError(messageOf(e));
        }
      } finally {
        if (seq === seqRef.current) setLoading(false);
      }
    }, debounceMs);
    return () => clearTimeout(t);
    // `key` captures the full request shape.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, debounceMs]);

  const confirm = useCallback(async (): Promise<ConfirmResponse> => {
    let current = proposalRef.current;
    if (!current) throw new Error("No active quote to confirm");
    try {
      return await ordersApi.confirm(current.proposal_id);
    } catch (e) {
      // 410 Gone → the quote expired; re-quote once and retry.
      if (statusOf(e) === 410 && requestRef.current) {
        const fresh = await ordersApi.proposal(requestRef.current);
        setProposal(fresh);
        proposalRef.current = fresh;
        current = fresh;
        return await ordersApi.confirm(fresh.proposal_id);
      }
      throw e;
    }
  }, []);

  return { proposal, loading, error, confirm };
}

function statusOf(e: unknown): number | undefined {
  return (e as { response?: { status?: number } })?.response?.status;
}

function messageOf(e: unknown): string {
  const detail = (e as { response?: { data?: { detail?: string } } })?.response
    ?.data?.detail;
  return detail ?? "Could not get a quote";
}
