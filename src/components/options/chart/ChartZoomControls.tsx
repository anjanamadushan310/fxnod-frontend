"use client";

import { CenterIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

interface ChartZoomControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenter?: () => void;
}

/**
 * Floating zoom cluster, bottom-left of the chart area. Pure UI — viewport
 * decisions will live in ChartCanvas later; these buttons just forward
 * callbacks.
 */
export function ChartZoomControls({
  onZoomIn,
  onZoomOut,
  onCenter,
}: ChartZoomControlsProps) {
  return (
    <div className="flex flex-col gap-1">
      <ZoomBtn ariaLabel="Zoom in" onClick={onZoomIn}>
        <PlusIcon className="h-4 w-4" />
      </ZoomBtn>
      <ZoomBtn ariaLabel="Center on latest" onClick={onCenter}>
        <CenterIcon className="h-4 w-4" />
      </ZoomBtn>
      <ZoomBtn ariaLabel="Zoom out" onClick={onZoomOut}>
        <MinusIcon className="h-4 w-4" />
      </ZoomBtn>
    </div>
  );
}

function ZoomBtn({
  ariaLabel,
  onClick,
  children,
}: {
  ariaLabel: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md",
        "border border-opt-line bg-opt-bg-elev text-opt-ink-3",
        "transition-colors hover:border-opt-line-strong hover:text-opt-ink",
      )}
    >
      {children}
    </button>
  );
}
