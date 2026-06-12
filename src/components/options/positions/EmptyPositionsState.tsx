/**
 * Quiet placeholder shown inside the PositionsDrawer when the user has no
 * open positions. Matches the Vela design: dashed border, centred message.
 */
export function EmptyPositionsState() {
  return (
    <div className="rounded-[10px] border border-dashed border-opt-line-strong px-3 py-5 text-center text-[12px] text-opt-ink-3">
      No open positions. Place a trade to get started.
    </div>
  );
}
