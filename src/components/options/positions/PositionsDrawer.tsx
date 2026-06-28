"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CaretDownIcon } from "@/components/ui/Icons";
import { useContractDetails } from "@/stores/useContractDetails";
import { useOpenPositions } from "@/stores/useOpenPositions";
import { cn } from "@/lib/cn";
import { ClosedPositionCard } from "./ClosedPositionCard";
import {
  MOCK_CLOSED_CONTRACTS,
  formatContractDate,
  simPositionToDetail,
  type ContractDetail,
} from "./contractDetail";
import { EmptyPositionsState } from "./EmptyPositionsState";
import { PositionCard } from "./PositionCard";

interface PositionsDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Positions drawer (Deriv §8–10). Open tab = live sim positions; Closed tab =
 * date-grouped closed contracts with an "All time" date filter. Stays mounted
 * for the slide animation — the OptionsShell column width clips it when closed.
 */
export function PositionsDrawer({ open, onClose }: PositionsDrawerProps) {
  const [tab, setTab] = useState<"open" | "closed">("open");

  const positions = useOpenPositions((s) => s.positions);
  const tick = useOpenPositions((s) => s.tick);
  const openDetail = useContractDetails((s) => s.open);

  const openTotal = useMemo(
    () => positions.reduce((acc, p) => acc + p.pnl, 0),
    [positions],
  );
  const closedTotal = useMemo(
    () => MOCK_CLOSED_CONTRACTS.reduce((acc, c) => acc + c.pnl, 0),
    [],
  );

  // Escape closes; drift P/L while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const id = setInterval(tick, 1500);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearInterval(id);
    };
  }, [open, onClose, tick]);

  const footerCount =
    tab === "open" ? positions.length : MOCK_CLOSED_CONTRACTS.length;
  const footerPnl = tab === "open" ? openTotal : closedTotal;
  const footerPositive = footerPnl >= 0;

  return (
    <div className="flex h-full w-[360px] flex-col border-r border-opt-line bg-opt-bg-elev">
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
        {tab === "open" ? (
          positions.length === 0 ? (
            <EmptyPositionsState label="You have no open positions." />
          ) : (
            <div className="flex flex-col gap-2">
              {positions.map((p) => (
                <PositionCard
                  key={p.id}
                  position={p}
                  onOpenDetails={() => openDetail(simPositionToDetail(p))}
                />
              ))}
            </div>
          )
        ) : (
          <ClosedTab onOpenDetails={openDetail} />
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-opt-line px-3 py-2.5 text-[12px]">
        <span className="text-opt-ink-3">
          {footerCount} {tab} position{footerCount === 1 ? "" : "s"}
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

// ─── Closed tab ──────────────────────────────────────────────────────────────

type FilterKey = "all" | "today" | "7d" | "30d";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
];

function ClosedTab({
  onOpenDetails,
}: {
  onOpenDetails: (c: ContractDetail) => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const nowRef = useRef<number>(0);

  const contracts = useMemo(() => {
    if (filter === "all") return MOCK_CLOSED_CONTRACTS;
    // Capture "now" lazily so the default ("all") render is SSR-deterministic.
    if (!nowRef.current) nowRef.current = Math.floor(Date.now() / 1000);
    const win =
      filter === "today" ? 86400 : filter === "7d" ? 7 * 86400 : 30 * 86400;
    return MOCK_CLOSED_CONTRACTS.filter(
      (c) => nowRef.current - c.exitTime <= win,
    );
  }, [filter]);

  const groups = useMemo(() => {
    const m = new Map<string, ContractDetail[]>();
    for (const c of contracts) {
      const k = formatContractDate(c.exitTime);
      const arr = m.get(k);
      if (arr) arr.push(c);
      else m.set(k, [c]);
    }
    return [...m.entries()];
  }, [contracts]);

  return (
    <div className="flex flex-col gap-3">
      <FilterDropdown value={filter} onChange={setFilter} />
      {contracts.length === 0 ? (
        <EmptyPositionsState label="No closed positions in this range." />
      ) : (
        groups.map(([date, items]) => (
          <div key={date} className="flex flex-col gap-2">
            <p className="px-1 text-[12px] font-semibold text-opt-ink-3">
              {date}
            </p>
            {items.map((c) => (
              <ClosedPositionCard
                key={c.id}
                contract={c}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function FilterDropdown({
  value,
  onChange,
}: {
  value: FilterKey;
  onChange: (k: FilterKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const label = FILTERS.find((f) => f.key === value)?.label ?? "All time";

  return (
    <div ref={ref} className="relative w-fit">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md bg-opt-bg-sunk px-2.5 py-1 text-[12px] font-medium text-opt-ink-2 transition-colors hover:text-opt-ink"
      >
        {label}
        <CaretDownIcon className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-10 w-[150px] overflow-hidden rounded-lg border border-opt-line bg-opt-bg-elev py-1 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                onChange(f.key);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-1.5 text-left text-[12px] transition-colors",
                f.key === value
                  ? "font-semibold text-opt-ink"
                  : "text-opt-ink-2 hover:bg-opt-bg-sunk hover:text-opt-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
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
