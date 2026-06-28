"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useContractDetails } from "@/stores/useContractDetails";
import { cn } from "@/lib/cn";
import { ContractDetailChart } from "./ContractDetailChart";
import {
  formatContractTime,
  type ContractDetail,
} from "./contractDetail";

/**
 * Contract Details modal (Deriv §10). Two-column: left metadata panel, right
 * isolated-tick chart. Portals into the `[data-app="options"]` subtree so the
 * scoped theme tokens apply. Driven by the useContractDetails store (opened
 * from a position card's ⇗ expand).
 */
export function ContractDetailsModal() {
  const detail = useContractDetails((s) => s.detail);
  const close = useContractDetails((s) => s.close);
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    setTarget(document.querySelector('[data-app="options"]') ?? document.body);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detail, close]);

  if (!detail || !target) return null;

  const lost = detail.outcome === "lost";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Contract details"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative z-10 flex h-[min(620px,calc(100vh-32px))] w-[min(900px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-opt-line bg-opt-bg-elev shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-opt-line px-4 py-3">
          <h2 className="text-[15px] font-bold text-opt-ink">Contract details</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="grid h-8 w-8 place-items-center rounded-lg text-opt-ink-3 transition-colors hover:bg-opt-bg-sunk hover:text-opt-ink"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Body: [left metadata] [right chart] */}
        <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr]">
          <LeftPanel detail={detail} lost={lost} />
          <div className="min-h-0 min-w-0 bg-opt-bg p-2">
            <ContractDetailChart detail={detail} />
          </div>
        </div>
      </div>
    </div>,
    target,
  );
}

function LeftPanel({
  detail,
  lost,
}: {
  detail: ContractDetail;
  lost: boolean;
}) {
  const pnlClass = lost ? "text-opt-fall" : "text-opt-rise";
  const dp = Math.abs(detail.entrySpot) < 10 ? 4 : 2;

  return (
    <div className="flex min-h-0 flex-col gap-3 overflow-y-auto border-r border-opt-line p-4 [scrollbar-width:thin]">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-opt-bg-sunk text-[11px] font-bold text-opt-ink-3">
          {detail.marketName.slice(0, 1)}
        </span>
        <span className="flex-1 truncate text-[13px] font-semibold text-opt-ink">
          {detail.marketName}
        </span>
        <span className="text-[12px] font-medium text-opt-ink-2">
          {detail.tradeTypeLabel}
        </span>
      </div>

      <span className="w-fit rounded bg-opt-bg-sunk px-2 py-0.5 text-[11px] font-semibold text-opt-ink-3">
        USD
      </span>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <Stat label="Total profit/loss" value={detail.pnl.toFixed(2)} className={pnlClass} />
        <Stat
          label="Contract value"
          value={detail.contractValue.toFixed(2)}
          className={lost ? "text-opt-ink-3" : "text-opt-rise"}
        />
        <Stat label="Stake" value={detail.stake.toFixed(2)} />
        <Stat label="Potential payout" value={detail.payout.toFixed(2)} />
      </div>

      <div className="h-px bg-opt-line" />

      <div className="flex flex-col gap-2.5">
        <Row label="Reference ID">
          <span className="font-mono">{detail.referenceBuy} (Buy)</span>
          {detail.referenceSell > 0 && (
            <span className="font-mono">{detail.referenceSell} (Sell)</span>
          )}
        </Row>
        <Row label="Duration">{detail.duration}</Row>
        <Row label="Barrier">
          <span className="font-mono">{detail.barrier}</span>
        </Row>
        <Row label="Start time">
          <span className="font-mono text-[11px]">
            {formatContractTime(detail.startTime)}
          </span>
        </Row>
        <Row label="Entry spot">
          <span className="font-mono">{detail.entrySpot.toFixed(dp)}</span>
          <span className="font-mono text-[11px] text-opt-ink-3">
            {formatContractTime(detail.entryTime)}
          </span>
        </Row>
        <Row label="Exit spot">
          <span className="font-mono">{detail.exitSpot.toFixed(dp)}</span>
          <span className="font-mono text-[11px] text-opt-ink-3">
            {formatContractTime(detail.exitTime)}
          </span>
        </Row>
        <Row label="Exit time">
          <span className="font-mono text-[11px]">
            {formatContractTime(detail.exitTime)}
          </span>
        </Row>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-opt-ink-3">{label}:</span>
      <span className={cn("font-mono text-[14px] font-semibold", className ?? "text-opt-ink")}>
        {value}
      </span>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12px]">
      <span className="text-opt-ink-3">{label}</span>
      <span className="flex flex-col items-end text-opt-ink">{children}</span>
    </div>
  );
}
