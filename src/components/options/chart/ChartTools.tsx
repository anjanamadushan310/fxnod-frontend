"use client";

import { useState } from "react";
import {
  AreaChartIcon,
  CandleChartIcon,
  DownloadIcon,
  IndicatorIcon,
  PencilIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import {
  intervalShortLabel,
  type ChartTypeId,
  type IntervalId,
} from "./chartSettings";
import { ChartSettingsPopover } from "./ChartSettingsPopover";

type LocalToolId = "indicator" | "draw" | "download";

const LOCAL_TOOLS: { id: LocalToolId; label: string; icon: React.ReactNode }[] =
  [
    { id: "indicator", label: "Indicators", icon: <IndicatorIcon className="h-4 w-4" /> },
    { id: "draw", label: "Draw", icon: <PencilIcon className="h-4 w-4" /> },
    { id: "download", label: "Download", icon: <DownloadIcon className="h-4 w-4" /> },
  ];

interface ChartToolsProps {
  /** Current chart type — derived from the URL (`?chart_type=`). */
  chartType: ChartTypeId;
  /** Current interval — derived from the URL (`?interval=`). */
  interval: IntervalId;
  /** Commit a new chart type to the URL. */
  onChartTypeChange: (id: ChartTypeId) => void;
  /** Commit a new interval to the URL. */
  onIntervalChange: (id: IntervalId) => void;
}

/**
 * Left-column tool strip.
 *
 * The top item is the chart-settings trigger: it shows the active interval
 * label (e.g. "1T") stacked over the active chart-type glyph and opens the
 * Chart-types / Time-interval popover on click. Selecting in the popover
 * writes to the URL (via the parent's setters) — there's no local chart
 * state here anymore.
 *
 * The remaining tools (indicators / draw / download) are still UI-only
 * placeholders, so their `active` highlight stays local.
 */
export function ChartTools({
  chartType,
  interval,
  onChartTypeChange,
  onIntervalChange,
}: ChartToolsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeLocal, setActiveLocal] = useState<LocalToolId | null>(null);

  return (
    <div className="relative flex flex-col items-center gap-1 pl-1 pt-2">
      {/* Chart-settings trigger: interval label + active chart-type glyph */}
      <button
        type="button"
        aria-label="Chart type and interval"
        aria-haspopup="dialog"
        aria-expanded={settingsOpen}
        title="Chart type & interval"
        onClick={() => setSettingsOpen((v) => !v)}
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1",
          "transition-colors duration-150",
          settingsOpen
            ? "bg-opt-bg-sunk text-opt-ink"
            : "text-opt-ink-3 hover:bg-opt-bg-sunk hover:text-opt-ink",
        )}
      >
        <span className="font-mono text-[10px] font-semibold leading-none">
          {intervalShortLabel(interval)}
        </span>
        <ChartTypeGlyph id={chartType} />
      </button>

      {settingsOpen && (
        <ChartSettingsPopover
          chartType={chartType}
          interval={interval}
          onSelectChartType={onChartTypeChange}
          onSelectInterval={onIntervalChange}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {LOCAL_TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          aria-label={tool.label}
          title={tool.label}
          onClick={() =>
            setActiveLocal((cur) => (cur === tool.id ? null : tool.id))
          }
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            "transition-colors duration-150",
            activeLocal === tool.id
              ? "bg-opt-bg-sunk text-opt-ink"
              : "text-opt-ink-3 hover:bg-opt-bg-sunk hover:text-opt-ink",
          )}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}

/** Small glyph mirroring the selected chart type on the trigger button. */
function ChartTypeGlyph({ id }: { id: ChartTypeId }) {
  if (id === "candle" || id === "hollow" || id === "ohlc") {
    return <CandleChartIcon className="h-4 w-4" />;
  }
  return <AreaChartIcon className="h-4 w-4" />;
}
