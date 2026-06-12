"use client";

import { useEffect, useMemo } from "react";
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
  const totalPositive = totalPnl >= 0;

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute left-[76px] top-[64px] z-20 flex h-[calc(100vh-64px)] w-[300px] flex-col",
        "border-r border-opt-line bg-opt-bg-elev",
        "shadow-[6px_0_20px_rgba(0,0,0,0.06)]",
      )}
    >
      <header className="flex items-center justify-between border-b border-opt-line px-3 py-3">
        <h2 className="m-0 font-sans text-[14px] font-semibold text-opt-ink">
          Open positions
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

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {positions.length === 0 ? (
          <EmptyPositionsState />
        ) : (
          <div className="flex flex-col gap-2">
            {positions.map((p) => (
              <PositionCard key={p.id} position={p} />
            ))}
          </div>
        )}
      </div>

      {positions.length > 0 && (
        <footer className="flex items-center justify-between border-t border-opt-line px-3 py-2.5 text-[12px]">
          <span className="text-opt-ink-3">
            {positions.length} open position{positions.length === 1 ? "" : "s"}
          </span>
          <span
            className={cn(
              "font-mono text-[12.5px] font-bold tabular-nums",
              totalPositive ? "text-opt-rise" : "text-opt-fall",
            )}
          >
            Total P/L: {totalPositive ? "+" : ""}
            {totalPnl.toFixed(2)} USD
          </span>
        </footer>
      )}
    </div>
  );
}
