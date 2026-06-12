"use client";

import { InfoIcon } from "@/components/ui/Icons";

interface InfoDotProps {
  label: string;
}

/**
 * Tiny info ⓘ glyph next to field labels (Growth rate, Take profit…). The
 * `label` doubles as the accessible tooltip — actual popover comes later.
 */
export function InfoDot({ label }: InfoDotProps) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-flex h-[14px] w-[14px] cursor-help items-center justify-center text-opt-ink-3 hover:text-opt-ink"
    >
      <InfoIcon className="h-[14px] w-[14px]" />
    </span>
  );
}
