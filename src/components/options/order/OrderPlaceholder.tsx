/**
 * Temporary placeholder for Phase C (order panel).
 *
 * Replace with the OrderPanel orchestrator that dispatches to one of
 * panels/RiseFallPanel.tsx, AccumulatorsPanel.tsx etc based on the active
 * contract type.
 */
import type { ContractTypeId } from "../layout/contractTypes";
import { CONTRACT_TYPES } from "../layout/contractTypes";

interface OrderPlaceholderProps {
  contractType: ContractTypeId;
}

export function OrderPlaceholder({ contractType }: OrderPlaceholderProps) {
  const label =
    CONTRACT_TYPES.find((t) => t.id === contractType)?.label ?? contractType;

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between text-xs text-opt-ink-3">
        <span>How to trade {label}?</span>
        <span className="font-medium text-opt-ink">›</span>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-opt-line-strong bg-opt-bg-elev p-6 text-center">
        <div>
          <h3 className="m-0 mb-1.5 font-sans text-sm font-semibold text-opt-ink">
            {label} order ticket
          </h3>
          <p className="m-0 text-[11px] leading-relaxed text-opt-ink-3">
            Phase C builds the contract-specific fields (Duration, Stake,
            Growth rate, Multiplier, etc.) plus the Buy button + payout.
          </p>
        </div>
      </div>
    </div>
  );
}
