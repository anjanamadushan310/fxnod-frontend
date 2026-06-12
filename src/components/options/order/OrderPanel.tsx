"use client";

import { CONTRACT_TYPES, type ContractTypeId } from "../layout/contractTypes";
import { AccumulatorsPanel } from "./panels/AccumulatorsPanel";
import { ComingSoonPanel } from "./panels/ComingSoonPanel";
import { EvenOddPanel } from "./panels/EvenOddPanel";
import { HigherLowerPanel } from "./panels/HigherLowerPanel";
import { MatchesDiffersPanel } from "./panels/MatchesDiffersPanel";
import { MultipliersPanel } from "./panels/MultipliersPanel";
import { OverUnderPanel } from "./panels/OverUnderPanel";
import { RiseFallPanel } from "./panels/RiseFallPanel";
import { TouchNoTouchPanel } from "./panels/TouchNoTouchPanel";
import { TurbosPanel } from "./panels/TurbosPanel";
import { VanillasPanel } from "./panels/VanillasPanel";

interface OrderPanelProps {
  contractType: ContractTypeId;
  symbol: string;
}

/**
 * Single switch-statement dispatcher. The mounted panel is keyed on
 * `contractType` so React unmounts the old panel (resets its internal state)
 * when the user picks a different contract.
 *
 * The key=contractType is deliberate — without it, going from Rise/Fall to
 * Accumulators back to Rise/Fall would preserve the stale state from the
 * abandoned tab.
 */
export function OrderPanel({ contractType, symbol }: OrderPanelProps) {
  return (
    <div key={contractType} className="flex h-full flex-col">
      {renderForType(contractType, symbol)}
    </div>
  );
}

function renderForType(id: ContractTypeId, symbol: string) {
  switch (id) {
    case "rise_fall":
      return <RiseFallPanel symbol={symbol} />;
    case "accumulators":
      return <AccumulatorsPanel symbol={symbol} />;
    case "multipliers":
      return <MultipliersPanel symbol={symbol} />;
    case "turbos":
      return <TurbosPanel symbol={symbol} />;
    case "vanillas":
      return <VanillasPanel symbol={symbol} />;
    case "higher_lower":
      return <HigherLowerPanel symbol={symbol} />;
    case "touch_no_touch":
      return <TouchNoTouchPanel symbol={symbol} />;
    case "matches_differs":
      return <MatchesDiffersPanel symbol={symbol} />;
    case "over_under":
      return <OverUnderPanel symbol={symbol} />;
    case "even_odd":
      return <EvenOddPanel symbol={symbol} />;
    default:
      return <ComingSoonPanel contractLabel={labelOf(id)} />;
  }
}

function labelOf(id: ContractTypeId): string {
  return CONTRACT_TYPES.find((c) => c.id === id)?.label ?? id;
}
