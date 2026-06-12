"use client";

import { HowToTradeLink } from "../HowToTradeLink";

interface ComingSoonPanelProps {
  contractLabel: string;
}

/**
 * Shared "Phase D" placeholder used by Multipliers / Turbos / Vanillas /
 * Higher-Lower / Touch-No-Touch / Matches-Differs / Over-Under / Even-Odd
 * until each gets its own panel.
 */
export function ComingSoonPanel({ contractLabel }: ComingSoonPanelProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <HowToTradeLink contractLabel={contractLabel} />

      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-opt-line-strong bg-opt-bg-elev p-6 text-center">
        <div>
          <h3 className="m-0 mb-1.5 font-sans text-sm font-semibold text-opt-ink">
            {contractLabel} order ticket
          </h3>
          <p className="m-0 text-[11px] leading-relaxed text-opt-ink-3">
            Coming in Phase D — same field primitives, panel-specific fields.
          </p>
        </div>
      </div>
    </div>
  );
}
