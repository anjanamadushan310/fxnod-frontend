import { Briefcase } from "lucide-react";

/**
 * Empty state inside the PositionsDrawer (Deriv §9): outlined briefcase glyph
 * + message. `label` lets the Open / Closed tabs reuse it.
 */
export function EmptyPositionsState({
  label = "You have no open positions.",
}: {
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-3 py-12 text-center">
      <Briefcase className="h-10 w-10 text-opt-ink-4" strokeWidth={1.5} />
      <p className="text-[13px] text-opt-ink-3">{label}</p>
    </div>
  );
}
