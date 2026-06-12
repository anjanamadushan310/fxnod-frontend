"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, RefreshIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { useTicking } from "@/hooks/useTicking";
import { fmtUSD } from "@/lib/format";
import { cn } from "@/lib/cn";

interface TotalValueCardProps {
  seed?: number;
  ticking?: boolean;
  onDeposit?: () => void;
}

/**
 * Navy hero card showing the portfolio total. The number itself ticks and
 * flashes green/red on each update (driven by `useTicking` + the
 * `.flash-up` / `.flash-dn` keyframes in globals.css).
 */
export function TotalValueCard({
  seed = 2500.5,
  ticking = true,
  onDeposit,
}: TotalValueCardProps) {
  const { value, dir, pulse } = useTicking(seed, ticking, 2000);
  const [spinning, setSpinning] = useState(false);
  const amountRef = useRef<HTMLSpanElement>(null);

  // Re-trigger the flash animation each pulse by removing + re-adding the class.
  useEffect(() => {
    const el = amountRef.current;
    if (!el) return;
    el.classList.remove("flash-up", "flash-dn");
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    void el.offsetWidth;
    if (dir > 0) el.classList.add("flash-up");
    if (dir < 0) el.classList.add("flash-dn");
  }, [pulse, dir]);

  const change = +(value - seed).toFixed(2);
  const pct = (change / seed) * 100;
  const up = change >= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-[18px] rounded-2xl border border-gold/20 px-[26px] py-[22px] text-[#f4eedb]",
        "bg-[radial-gradient(120%_240%_at_100%_0%,rgba(201,162,78,0.18),transparent_50%),linear-gradient(135deg,var(--navy)_0%,var(--navy-3)_100%)]",
        "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_10px_30px_-14px_rgba(10,20,48,0.4)]",
        "max-lg:flex-wrap max-lg:px-[18px] max-lg:py-[18px]",
      )}
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f4eedb]/60">
          Total Value
        </div>
        <div className="mt-0.5 flex items-center gap-2.5 text-[32px] font-bold tracking-[-0.01em] max-lg:text-[26px]">
          <span ref={amountRef} className="tnum">
            {fmtUSD(value)}
          </span>
          <button
            type="button"
            aria-label="Refresh"
            onClick={() => {
              setSpinning(true);
              setTimeout(() => setSpinning(false), 700);
            }}
            className={cn(
              "grid h-6 w-6 place-items-center rounded-full border-0 bg-transparent text-[#f4eedb]/55",
              "transition-colors hover:bg-white/[0.06] hover:text-white",
              spinning && "spin",
            )}
          >
            <RefreshIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "ml-auto flex flex-col items-end gap-0.5 text-xs text-[#f4eedb]/70",
          "max-lg:ml-0 max-lg:w-full max-lg:flex-row max-lg:justify-end",
        )}
      >
        <span>Today</span>
        <b
          className={cn(
            "flex items-center gap-1 font-bold",
            up ? "text-[#7fd391]" : "text-[#f08a8a]",
          )}
        >
          {up ? (
            <ArrowUpIcon className="h-3 w-3" />
          ) : (
            <ArrowDownIcon className="h-3 w-3" />
          )}
          {up ? "+" : "−"}
          {fmtUSD(Math.abs(change)).slice(1)} ({up ? "+" : "−"}
          {Math.abs(pct).toFixed(2)}%)
        </b>
      </div>

      <Button variant="gold" onClick={onDeposit} className="max-lg:ml-auto">
        Deposit
      </Button>
    </div>
  );
}
