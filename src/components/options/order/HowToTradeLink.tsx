"use client";

import { ChevronIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

interface HowToTradeLinkProps {
  contractLabel: string;
  href?: string;
  onClick?: () => void;
}

/**
 * The grey "How to trade X? ›" link that sits above every order panel.
 *
 * Real implementation will open a help drawer / lesson; for now it's just a
 * styled button to lock the layout.
 */
export function HowToTradeLink({
  contractLabel,
  onClick,
}: HowToTradeLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-2 bg-transparent border-0",
        "w-full text-[12px] text-opt-ink-3",
        "hover:text-opt-ink",
      )}
    >
      <span>
        How to trade <span className="text-opt-ink">{contractLabel}</span>?
      </span>
      <ChevronIcon className="h-3 w-3" />
    </button>
  );
}
