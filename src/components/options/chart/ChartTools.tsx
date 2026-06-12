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

type ToolId = "area" | "line" | "candle" | "indicator" | "draw" | "download";

const TOOLS: { id: ToolId; label: string; icon: React.ReactNode }[] = [
  // "1T" + area icon — area is the default selected (matches design).
  { id: "area", label: "Area chart", icon: <AreaChartIcon className="h-4 w-4" /> },
  { id: "line", label: "Line chart", icon: <LineChartGlyph /> },
  { id: "candle", label: "Candles", icon: <CandleChartIcon className="h-4 w-4" /> },
  { id: "indicator", label: "Indicators", icon: <IndicatorIcon className="h-4 w-4" /> },
  { id: "draw", label: "Draw", icon: <PencilIcon className="h-4 w-4" /> },
  { id: "download", label: "Download", icon: <DownloadIcon className="h-4 w-4" /> },
];

/**
 * Left-column tool strip. UI-only state — toggling a tool doesn't change
 * chart data, so the chart canvas above doesn't re-render.
 */
export function ChartTools() {
  const [active, setActive] = useState<ToolId>("area");
  return (
    <div className="flex flex-col items-center gap-1 pl-1 pt-2">
      {/* "1T" timeframe label (Vela design) */}
      <div className="grid h-8 w-8 place-items-center rounded-md font-mono text-[10px] font-semibold text-opt-ink-3">
        1T
      </div>
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          aria-label={tool.label}
          title={tool.label}
          onClick={() => setActive(tool.id)}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            "transition-colors duration-150",
            active === tool.id
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

function LineChartGlyph() {
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
      <path d="M3 18 8 12 12 14 16 8 21 12" />
    </svg>
  );
}
