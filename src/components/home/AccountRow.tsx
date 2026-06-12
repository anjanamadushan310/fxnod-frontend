"use client";

import { Button } from "@/components/ui/Button";
import { useTicking } from "@/hooks/useTicking";
import { fmtUSD } from "@/lib/format";
import { cn } from "@/lib/cn";

interface AccountRowProps {
  name: string;
  seed: number;
  ticking?: boolean;
  onDeposit?: () => void;
  onTrade?: () => void;
  onDetails?: () => void;
}

export function AccountRow({
  name,
  seed,
  ticking = true,
  onDeposit,
  onTrade,
  onDetails,
}: AccountRowProps) {
  // Stagger interval per row so multiple cards don't all tick in lockstep.
  // The +random is computed once per mount via the seed value, not on every render.
  const { value } = useTicking(seed, ticking, 2200 + ((seed * 7) % 800));
  const change = +(value - seed).toFixed(2);
  const pct = (change / seed) * 100;
  const up = change >= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4",
        "shadow-card transition-colors",
        "hover:border-gold/40",
        "max-lg:flex-wrap max-lg:gap-3 max-lg:p-3.5",
      )}
    >
      <div
        className={cn(
          "grid h-[42px] w-[42px] flex-none place-items-center rounded-[10px]",
          "text-[10px] font-extrabold tracking-[0.1em] text-gold",
          "bg-[linear-gradient(135deg,var(--navy),var(--navy-3))]",
          "shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_10px_-4px_rgba(10,20,48,0.3)]",
        )}
      >
        FX
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="text-[13px] font-semibold text-ink-2">{name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xl font-bold tracking-[-0.01em] text-ink max-lg:text-lg">
          <span className="tnum">{fmtUSD(value)}</span>
          {Math.abs(pct) > 0.001 && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                up
                  ? "bg-[rgba(36,140,73,0.12)] text-[#1f7a3f] dark:bg-[rgba(127,211,145,0.14)] dark:text-[#9be0a8]"
                  : "bg-[rgba(199,72,72,0.12)] text-[#a04545] dark:bg-[rgba(240,138,138,0.14)] dark:text-[#f0a0a0]",
              )}
            >
              {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 max-lg:w-full max-lg:justify-end">
        <Button variant="ghost" onClick={onDeposit}>
          Deposit
        </Button>
        <Button variant="ghost" onClick={onTrade}>
          Trade
        </Button>
        <Button variant="ghost" onClick={onDetails}>
          Details
        </Button>
      </div>
    </div>
  );
}
