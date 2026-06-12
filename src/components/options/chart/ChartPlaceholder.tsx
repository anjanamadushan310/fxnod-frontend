/**
 * Temporary placeholder for Phase B (chart panel).
 *
 * Replace with:
 *   - MarketPill (top of the chart column)
 *   - ChartTools (left strip)
 *   - ChartCanvas (live-ticking SVG)
 *   - ChartZoomControls + CurrentPriceTag
 *   - StatsStrip (Accumulators only)
 *
 * Keep this file deletable — no other component should import from it.
 */
export function ChartPlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center text-center">
      <div className="max-w-sm rounded-xl border border-dashed border-opt-line-strong bg-opt-bg-elev p-8">
        <h3 className="m-0 mb-1.5 font-sans text-base font-semibold text-opt-ink">
          Chart panel — Phase B
        </h3>
        <p className="m-0 text-xs leading-relaxed text-opt-ink-3">
          MarketPill, ChartCanvas (live-ticking SVG), tools strip, zoom
          controls and the floating price tag live here next.
        </p>
      </div>
    </div>
  );
}
