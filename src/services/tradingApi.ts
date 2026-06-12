import { api } from "./api";
import type { ContractTypeId } from "@/components/options/layout/contractTypes";

/**
 * Trading service client — Deriv OAuth linking + the two-phase proposal /
 * confirm order flow.
 *
 * Contract mapping (frontend id + side → Deriv contract_type) lives on the
 * BACKEND; the frontend only sends its own ids and the per-type params. The
 * backend validates the combination and returns 422 on anything invalid.
 */

// ─── Deriv OAuth ────────────────────────────────────────────────────────────

export interface DerivAccount {
  /** loginid, e.g. CR123456 (real) or VRTC987654 (demo). */
  account: string;
  token: string;
  currency: string;
  /** Demo account — derived from the VRTC loginid prefix. */
  isVirtual: boolean;
}

export interface AccountStatus {
  linked: boolean;
  deriv_account_id?: string;
  currency?: string;
  is_virtual: boolean;
}

export const derivApi = {
  /** Start linking — returns the Deriv authorize URL + CSRF state. */
  async authorize(): Promise<{ authorize_url: string; state: string }> {
    const res = await api.get("/api/v1/deriv/oauth/authorize");
    return res.data;
  },

  /** Link the account the user picked from the callback list. No auto-link. */
  async link(account: DerivAccount, state: string): Promise<void> {
    await api.post("/api/v1/deriv/oauth/link", {
      state,
      token: account.token,
      deriv_account_id: account.account,
      currency: account.currency,
      is_virtual: account.isVirtual,
    });
  },

  async status(): Promise<AccountStatus> {
    const res = await api.get<AccountStatus>("/api/v1/deriv/account/status");
    return res.data;
  },

  async unlink(): Promise<void> {
    await api.delete("/api/v1/deriv/oauth");
  },
};

/**
 * Parse the account list Deriv appends to the OAuth callback URL:
 *   ?acct1=CR123&token1=a1-x&cur1=USD&acct2=VRTC9&token2=a1-y&cur2=USD
 *
 * Returns the accounts in order; demo accounts (VRTC*) are flagged so the FE
 * picker can label them clearly.
 */
export function parseDerivCallback(search: string): DerivAccount[] {
  const params = new URLSearchParams(search);
  const accounts: DerivAccount[] = [];
  for (let i = 1; ; i++) {
    const account = params.get(`acct${i}`);
    const token = params.get(`token${i}`);
    if (!account || !token) break;
    accounts.push({
      account,
      token,
      currency: params.get(`cur${i}`) ?? "USD",
      isVirtual: account.toUpperCase().startsWith("VRTC"),
    });
  }
  return accounts;
}

// ─── Orders: proposal → confirm ─────────────────────────────────────────────

/** Discriminated proposal body. `side` is the toggle's "rise"/"fall". */
export interface ProposalRequest {
  contract_type: ContractTypeId;
  side?: "rise" | "fall";
  symbol: string;
  stake: string; // decimal as string — never a JS float
  currency?: string;
  duration?: number;
  duration_unit?: "t" | "s" | "m" | "h" | "d";
  barrier?: string;
  digit?: number;
  growth_rate?: number; // percent 1–5
  multiplier?: number;
  take_profit?: string;
  stop_loss?: string;
}

export interface ProposalResponse {
  proposal_id: string;
  deriv_proposal_id: string;
  stake_amount: string;
  payout_amount: string;
  accrued_markup_amount: string;
  currency: string;
  expires_at: string;
  expires_in_seconds: number;
}

export interface ConfirmResponse {
  trade_id: string;
  deriv_contract_id: string;
  buy_price: string;
  payout_amount: string;
  accrued_markup_amount: string;
  deriv_settlement_period: string;
}

export const ordersApi = {
  /** Get a binding quote (~5s TTL). 422 = invalid params, 428 = no account. */
  async proposal(body: ProposalRequest): Promise<ProposalResponse> {
    const res = await api.post<ProposalResponse>(
      "/api/v1/orders/proposal",
      body,
    );
    return res.data;
  },

  /**
   * Execute the most recent proposal. The backend caps the buy at the quoted
   * price (slippage guard) and 410s if the 5s TTL has lapsed → caller should
   * re-quote and retry.
   */
  async confirm(proposalId: string): Promise<ConfirmResponse> {
    const res = await api.post<ConfirmResponse>("/api/v1/orders/confirm", {
      proposal_id: proposalId,
    });
    return res.data;
  },
};
