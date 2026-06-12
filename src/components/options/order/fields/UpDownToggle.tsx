"use client";

import { RiseFallToggle, type Side } from "./RiseFallToggle";

interface UpDownToggleProps {
  value: Side;
  onChange: (next: Side) => void;
}

/**
 * Thin wrapper used by Multipliers / Turbos / Higher-Lower. Reuses the
 * RiseFallToggle internals so visual + accessibility behaviour stays
 * identical — only the labels change.
 *
 * Semantic mapping: `rise` → Up (green), `fall` → Down (red).
 */
export function UpDownToggle({ value, onChange }: UpDownToggleProps) {
  return (
    <RiseFallToggle
      value={value}
      onChange={onChange}
      labels={{ rise: "Up", fall: "Down" }}
    />
  );
}
