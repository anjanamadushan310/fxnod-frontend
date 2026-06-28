"use client";

import { useState } from "react";
import { Crosshair } from "lucide-react";
import {
  AreaChartIcon,
  DownloadIcon,
  IndicatorIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import {
  intervalShortLabel,
  type ChartTypeId,
  type IntervalId,
} from "./chartSettings";
import { ChartTypesModal } from "./ChartTypesModal";
import { DrawingToolsPanel } from "./DrawingToolsPanel";

interface ChartToolbarProps {
  chartType: ChartTypeId;
  interval: IntervalId;
  /** Digit trade types restrict the interval grid to "1 tick" (§4.2.2). */
  tickOnly: boolean;
  onChartTypeChange: (id: ChartTypeId) => void;
  onIntervalChange: (id: IntervalId) => void;
}

/**
 * Left vertical chart toolbar (Deriv §4.1): 5 stacked controls. The top
 * "Chart types" icon carries a live interval badge ("1T") and opens the Chart
 * Types modal; the pencil opens the Drawing Tools panel. Indicators /
 * Templates / Download are UI-only placeholders for now.
 */
export function ChartToolbar({
  chartType,
  interval,
  tickOnly,
  onChartTypeChange,
  onIntervalChange,
}: ChartToolbarProps) {
  const [typesOpen, setTypesOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const [activePlaceholder, setActivePlaceholder] = useState<string | null>(
    null,
  );

  return (
    <div className="flex flex-col items-center gap-1 pl-1 pt-2">
      {/* 1 — Chart types (with interval badge) */}
      <button
        type="button"
        aria-label="Chart types"
        aria-haspopup="dialog"
        aria-expanded={typesOpen}
        title="Chart types"
        onClick={() => setTypesOpen(true)}
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 transition-colors",
          typesOpen
            ? "bg-opt-bg-sunk text-opt-ink"
            : "text-opt-ink-3 hover:bg-opt-bg-sunk hover:text-opt-ink",
        )}
      >
        <span className="font-mono text-[10px] font-semibold leading-none">
          {intervalShortLabel(interval)}
        </span>
        <AreaChartIcon className="h-4 w-4" />
      </button>

      {/* 2 — Indicators (placeholder) */}
      <ToolbarButton
        label="Indicators"
        active={activePlaceholder === "indicators"}
        onClick={() =>
          setActivePlaceholder((c) => (c === "indicators" ? null : "indicators"))
        }
      >
        <IndicatorIcon className="h-4 w-4" />
      </ToolbarButton>

      {/* 3 — Templates (placeholder) */}
      <ToolbarButton
        label="Templates"
        active={activePlaceholder === "templates"}
        onClick={() =>
          setActivePlaceholder((c) => (c === "templates" ? null : "templates"))
        }
      >
        <TemplatesGlyph />
      </ToolbarButton>

      {/* 4 — Drawing tools */}
      <ToolbarButton
        label="Drawing tools"
        active={drawOpen}
        onClick={() => setDrawOpen(true)}
      >
        <PencilIcon className="h-4 w-4" />
      </ToolbarButton>

      {/* 5 — Download (placeholder) */}
      <ToolbarButton label="Download" active={false} onClick={() => undefined}>
        <DownloadIcon className="h-4 w-4" />
      </ToolbarButton>

      {typesOpen && (
        <ChartTypesModal
          chartType={chartType}
          interval={interval}
          tickOnly={tickOnly}
          onSelectChartType={onChartTypeChange}
          onSelectInterval={onIntervalChange}
          onClose={() => setTypesOpen(false)}
        />
      )}
      {drawOpen && <DrawingToolsPanel onClose={() => setDrawOpen(false)} />}
    </div>
  );
}

/**
 * Floating lower-left chart navigation controls (Deriv §4.4): zoom in,
 * crosshair toggle, zoom out. Overlaid on the canvas (not part of the toolbar
 * group). UI-only for now — wiring to the chart API comes later.
 */
export function ChartNavControls() {
  const [crosshair, setCrosshair] = useState(true);

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-opt-line bg-opt-bg-elev/90 p-1 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-sm">
      <NavButton label="Zoom in" onClick={() => undefined}>
        <PlusIcon className="h-4 w-4" />
      </NavButton>
      <NavButton
        label={crosshair ? "Disable Crosshair" : "Enable Crosshair"}
        active={crosshair}
        onClick={() => setCrosshair((v) => !v)}
      >
        <Crosshair className="h-4 w-4" />
      </NavButton>
      <NavButton label="Zoom out" onClick={() => undefined}>
        <MinusIcon className="h-4 w-4" />
      </NavButton>
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg transition-colors",
        active
          ? "bg-opt-bg-sunk text-opt-ink"
          : "text-opt-ink-3 hover:bg-opt-bg-sunk hover:text-opt-ink",
      )}
    >
      {children}
    </button>
  );
}

function NavButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md transition-colors",
        active
          ? "bg-opt-bg-sunk text-opt-ink"
          : "text-opt-ink-3 hover:bg-opt-bg-sunk hover:text-opt-ink",
      )}
    >
      {children}
    </button>
  );
}

function TemplatesGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 12h4l3-7 4 14 3-7h4" />
      <path d="M3 20h18" opacity="0.5" />
    </svg>
  );
}
