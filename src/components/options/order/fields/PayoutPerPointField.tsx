"use client";

import { Field } from "./Field";
import { InfoDot } from "./InfoDot";

interface PayoutPerPointFieldProps {
  value: number;
  currency?: string;
}

/**
 * Read-only "Payout per point" field for Turbos. Value is derived by the
 * parent panel (formula or proposal API).
 */
export function PayoutPerPointField({
  value,
  currency = "USD",
}: PayoutPerPointFieldProps) {
  return (
    <Field
      label="Payout per point"
      trailing={<InfoDot label="Payout per point info" />}
    >
      <span className="font-mono text-[14px] font-semibold tabular-nums text-opt-ink">
        {value.toFixed(2)}
      </span>
      <span className="text-[13px] font-medium text-opt-ink-3">{currency}</span>
    </Field>
  );
}
