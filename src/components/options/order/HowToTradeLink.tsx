"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { HowToTradeModal } from "./HowToTradeModal";

interface HowToTradeLinkProps {
  contractLabel: string;
}

/**
 * The teal "How to trade X? ›" link at the top of every order panel. Opens the
 * HowToTradeModal (§7.1) for the current trade type.
 */
export function HowToTradeLink({ contractLabel }: HowToTradeLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center justify-between gap-2 border-0 bg-transparent",
          "w-full text-[12px] text-opt-ink-3 hover:text-opt-ink",
        )}
      >
        <span>
          How to trade{" "}
          <span className="font-medium" style={{ color: "#00A79E" }}>
            {contractLabel}
          </span>
          ?
        </span>
        <ChevronIcon className="h-3 w-3" style={{ color: "#00A79E" }} />
      </button>

      {open && (
        <HowToTradeModal
          contractLabel={contractLabel}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
