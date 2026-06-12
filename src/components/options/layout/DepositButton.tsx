"use client";

import { cn } from "@/lib/cn";

interface DepositButtonProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Coral/red rounded pill at the top right (Vela's deposit colour, not the
 * home page's gold). Uses --opt-fall by default so it tracks the dark/light
 * theme without extra rules.
 */
export function DepositButton({ onClick, className }: DepositButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-shrink-0 rounded-full border-0 px-[18px] py-2 text-[13px] font-semibold text-white",
        "bg-opt-fall hover:brightness-95 transition-[filter] duration-150",
        className,
      )}
    >
      Deposit
    </button>
  );
}
