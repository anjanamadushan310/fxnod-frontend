"use client";

import { CaretDownIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

export type OptionsAccountMode = "real" | "demo";

interface AccountSelectorProps {
  mode: OptionsAccountMode;
  balance: number;
  currency?: string;
  onOpen?: () => void;
}

/**
 * Compact account chip — top right of the bar. Clicking opens the account
 * switcher (dropdown panel implemented later). Balance is `tabular-nums`
 * so digit-by-digit ticking doesn't make the layout jitter.
 */
export function AccountSelector({
  mode,
  balance,
  currency = "USD",
  onOpen,
}: AccountSelectorProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex flex-shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-1.5",
        "text-left transition-colors hover:bg-opt-bg-sunk",
      )}
    >
      <div className="flex flex-col leading-tight">
        <span className="flex items-center gap-1 text-[11px] text-opt-ink-3">
          {mode === "real" ? "Real account" : "Demo account"}
          <CaretDownIcon className="h-3 w-3" />
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums text-opt-ink">
          {balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {currency}
        </span>
      </div>
    </button>
  );
}
