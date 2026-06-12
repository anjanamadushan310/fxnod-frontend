"use client";

import { useEffect, useState } from "react";
import { ExpandIcon } from "@/components/ui/Icons";

/**
 * Bottom-right strip — green status dot, current date and a live GMT clock.
 *
 * The clock owns its own 1-second ticker so it's the only thing repainting
 * — the chart canvas and order panel are unaffected.
 */
export function ChartFooter() {
  const now = useNowGMT();
  return (
    <div className="flex h-7 items-center justify-end gap-3 px-4 text-[11px] text-opt-ink-3">
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-opt-rise" />
        <span className="font-mono tabular-nums">
          {formatDate(now)}
        </span>
      </span>
      <span className="font-mono tabular-nums text-opt-ink">
        {formatTime(now)} GMT
      </span>
      <button
        type="button"
        aria-label="Fullscreen"
        className="grid h-5 w-5 place-items-center rounded text-opt-ink-3 hover:text-opt-ink"
      >
        <ExpandIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function useNowGMT() {
  // Render the SSR value as "—" so server/client markup matches, then hydrate
  // to the real time on the client. Prevents the "now" mismatch warning.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toUTCString().slice(5, 16); // "21 May 2026"
}

function formatTime(d: Date | null) {
  if (!d) return "--:--:--";
  return [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
