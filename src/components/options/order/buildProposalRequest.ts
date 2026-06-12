import type { ContractTypeId } from "../layout/contractTypes";
import type { DurationUnit } from "./fields/DurationField";
import type { ProposalRequest } from "@/services/tradingApi";

/**
 * Maps an order panel's local state into the backend proposal body.
 *
 * Each panel passes ONLY the fields its contract type uses, so the resulting
 * request never carries a forbidden param (which the backend would 422). The
 * frontend↔Deriv contract mapping itself lives on the backend — here we only
 * translate units and number→string for money/barrier.
 */
export interface BuildProposalInput {
  contractType: ContractTypeId;
  symbol: string;
  stake: number;
  side?: "rise" | "fall";
  duration?: { amount: number; unit: DurationUnit };
  /** Signed offset (higher/lower, touch) or strike (vanillas). */
  barrier?: number;
  digit?: number;
  growthRate?: number; // percent 1–5
  multiplier?: number;
  takeProfit?: number | null;
  stopLoss?: number | null;
}

// FE duration units → Deriv duration_unit codes.
const UNIT_MAP: Record<DurationUnit, "t" | "s" | "m" | "h" | "d"> = {
  ticks: "t",
  s: "s",
  min: "m",
  h: "h",
  d: "d",
};

function signed(n: number): string {
  return (n >= 0 ? "+" : "") + n.toString();
}

export function buildProposalRequest(
  input: BuildProposalInput,
): ProposalRequest {
  const body: ProposalRequest = {
    contract_type: input.contractType,
    symbol: input.symbol,
    stake: input.stake.toString(),
  };

  if (input.side) body.side = input.side;
  if (input.duration) {
    body.duration = input.duration.amount;
    body.duration_unit = UNIT_MAP[input.duration.unit];
  }
  if (input.barrier !== undefined) body.barrier = signed(input.barrier);
  if (input.digit !== undefined) body.digit = input.digit;
  if (input.growthRate !== undefined) body.growth_rate = input.growthRate;
  if (input.multiplier !== undefined) body.multiplier = input.multiplier;
  if (input.takeProfit != null) body.take_profit = input.takeProfit.toString();
  if (input.stopLoss != null) body.stop_loss = input.stopLoss.toString();

  return body;
}
