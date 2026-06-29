"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { PencilIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import {
  useChartDrawings,
  type Drawing,
  type DrawingTool,
} from "@/stores/useChartDrawings";
import { useLiveMarket } from "@/stores/useLiveMarket";

const TEAL = "#00A79E";

type DrawTab = "active" | "all";

const TOOLS: { id: DrawingTool; label: string; preview: React.ReactNode }[] = [
  { id: "horizontal", label: "Horizontal line", preview: <HorizontalPreview /> },
  { id: "trend", label: "Trend line", preview: <TrendPreview /> },
  { id: "vertical", label: "Vertical line", preview: <VerticalPreview /> },
];

const TOOL_PREVIEW: Record<DrawingTool, React.ReactNode> = {
  horizontal: <HorizontalPreview />,
  trend: <TrendPreview />,
  vertical: <VerticalPreview />,
};

/** Short human label for an active drawing row. */
function drawingLabel(d: Drawing): string {
  if (d.tool === "horizontal") return `Horizontal · ${d.price?.toFixed(2) ?? ""}`;
  if (d.tool === "vertical") {
    const t = d.time ? new Date(d.time * 1000) : null;
    return `Vertical · ${t ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}`;
  }
  return "Trend line";
}

/**
 * Drawing Tools split-pane modal (Deriv §4.3). Left nav (Active / All drawings,
 * red left-border on the active tab); right pane lists the tools. Selecting a
 * tool closes the panel (chart drawing wiring comes later).
 */
export function DrawingToolsPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<DrawTab>("all");

  const symbol = useLiveMarket((s) => s.symbol);
  const allDrawings = useChartDrawings((s) => s.drawings);
  const setActiveTool = useChartDrawings((s) => s.setActiveTool);
  const removeDrawing = useChartDrawings((s) => s.removeDrawing);
  const active = allDrawings.filter((d) => d.symbol === symbol);

  /** Arm a tool for the next click(s) on the chart, then close the panel. */
  function selectTool(tool: DrawingTool) {
    setActiveTool(tool);
    onClose();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Drawing tools"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-[380px] w-[min(520px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-opt-line bg-opt-bg-elev shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-opt-line px-5 py-4">
          <h2 className="text-[16px] font-bold text-opt-ink">Drawing tools</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-opt-ink-3 transition-colors hover:bg-opt-bg-sunk hover:text-opt-ink"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Split pane: [left nav | right content] */}
        <div className="grid min-h-0 flex-1 grid-cols-[160px_1fr]">
          <div className="flex flex-col gap-0.5 border-r border-opt-line bg-opt-bg-sunk p-2">
            <NavTab
              label="Active"
              active={tab === "active"}
              onClick={() => setTab("active")}
              icon={<BoltIcon />}
            />
            <NavTab
              label="All drawings"
              active={tab === "all"}
              onClick={() => setTab("all")}
              icon={<PencilIcon className="h-[15px] w-[15px]" />}
            />
          </div>

          <div className="min-h-0 overflow-y-auto p-2">
            {tab === "active" ? (
              active.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-opt-bg-sunk text-opt-ink-4">
                    <PencilIcon className="h-5 w-5" />
                  </span>
                  <p className="text-[13px] text-opt-ink-3">
                    You have no active drawings yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {active.map((d) => (
                    <div
                      key={d.id}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-opt-bg-sunk"
                    >
                      <span className="flex h-5 w-6 flex-shrink-0 items-center justify-center">
                        {TOOL_PREVIEW[d.tool]}
                      </span>
                      <span className="flex-1 truncate text-[13.5px] font-medium text-opt-ink">
                        {drawingLabel(d)}
                      </span>
                      <button
                        type="button"
                        aria-label="Delete drawing"
                        title="Delete drawing"
                        onClick={() => removeDrawing(d.id)}
                        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md text-opt-ink-4 transition-colors hover:bg-opt-bg-elev hover:text-opt-fall"
                      >
                        <Trash2 className="h-[15px] w-[15px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => selectTool(tool.id)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-opt-bg-sunk"
                  >
                    <span className="flex h-5 w-6 flex-shrink-0 items-center justify-center">
                      {tool.preview}
                    </span>
                    <span className="text-[13.5px] font-medium text-opt-ink">
                      {tool.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavTab({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
        active
          ? "bg-opt-bg-elev text-opt-ink"
          : "text-opt-ink-3 hover:text-opt-ink",
      )}
    >
      {/* §4.3.1: red left-border accent on the active tab */}
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r"
          style={{ backgroundColor: "#FF4444" }}
        />
      )}
      <span className="text-opt-ink-3">{icon}</span>
      {label}
    </button>
  );
}

// ─── glyphs ──────────────────────────────────────────────────────────────────

function HorizontalPreview() {
  return (
    <svg viewBox="0 0 24 16" className="h-4 w-6">
      <line x1="2" y1="8" x2="22" y2="8" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function TrendPreview() {
  return (
    <svg viewBox="0 0 24 16" className="h-4 w-6">
      <line x1="3" y1="13" x2="21" y2="3" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function VerticalPreview() {
  return (
    <svg viewBox="0 0 24 16" className="h-4 w-6">
      <line x1="12" y1="2" x2="12" y2="14" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px]"
    >
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}
