"use client";

import { useEffect, useMemo, useState } from "react";
import { useMockPositions } from "@/hooks/useMockPositions";
import { cn } from "@/lib/cn";
import { EmptyPositionsState } from "./EmptyPositionsState";
import { PositionCard } from "./PositionCard";

interface PositionsDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-in drawer on the LEFT of the main column (next to the icon
 * sidebar) showing all open positions + a P/L summary footer.
 *
 * Owns its own `useMockPositions` subscription so neither the chart nor
 * the order panel re-renders on P/L ticks.
 */
export function PositionsDrawer({ open, onClose }: PositionsDrawerProps) {
  const [tab, setTab] = useState<"open" | "closed">("open");

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const positions = useMockPositions();
  const totalPnl = useMemo(
    () => positions.reduce((acc, p) => acc + p.pnl, 0),
    [positions],
  );

  if (!open) return null;

  // Closed positions aren't wired yet (§10) — empty for now.
  const list = tab === "open" ? positions : [];
  const footerPnl = tab === "open" ? totalPnl : 0;
  const footerPositive = footerPnl >= 0;

  return (
    <div
      className={cn(
        "absolute left-[76px] top-[64px] z-20 flex h-[calc(100vh-64px)] w-[360px] flex-col",
        "border-r border-opt-line bg-opt-bg-elev",
        "shadow-[6px_0_20px_rgba(0,0,0,0.06)]",
      )}
    >
      <header className="flex items-center justify-between border-b border-opt-line px-3 py-3">
        <h2 className="m-0 font-sans text-[14px] font-semibold text-opt-ink">
          Positions
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-md border-0 bg-transparent text-opt-ink-3 hover:bg-opt-bg-sunk hover:text-opt-ink"
        >
          ✕
        </button>
      </header>

      {/* Open / Closed tabs (§9: dark active underline) */}
      <div className="flex gap-4 border-b border-opt-line px-3">
        <DrawerTab on={tab === "open"} onClick={() => setTab("open")}>
          Open
        </DrawerTab>
        <DrawerTab on={tab === "closed"} onClick={() => setTab("closed")}>
          Closed
        </DrawerTab>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {list.length === 0 ? (
          <EmptyPositionsState
            label={
              tab === "open"
                ? "You have no open positions."
                : "You have no closed positions."
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((p) => (
              <PositionCard key={p.id} position={p} />
            ))}
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-opt-line px-3 py-2.5 text-[12px]">
        <span className="text-opt-ink-3">
          {list.length} {tab} position{list.length === 1 ? "" : "s"}
        </span>
        <span
          className={cn(
            "font-mono text-[12.5px] font-bold tabular-nums",
            footerPositive ? "text-opt-rise" : "text-opt-fall",
          )}
        >
          Total P/L: {footerPositive ? "+" : ""}
          {footerPnl.toFixed(2)} USD
        </span>
      </footer>
    </div>
  );
}

function DrawerTab({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative -mb-px py-2.5 text-[13px] font-medium transition-colors",
        on ? "text-opt-ink" : "text-opt-ink-3 hover:text-opt-ink",
      )}
    >
      {children}
      {on && (
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-opt-ink" />
      )}
    </button>
  );
}
