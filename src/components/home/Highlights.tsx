import { ChartPreview } from "./ChartPreview";
import { cn } from "@/lib/cn";

interface HighlightCard {
  variant: "analytics" | "charts" | "signals";
  label: string;
  bgClass: string;
}

const CARDS: HighlightCard[] = [
  {
    variant: "analytics",
    label: "FXNOD Analytics",
    bgClass: "bg-[linear-gradient(180deg,#0f1a3f,#0b1532)]",
  },
  {
    variant: "charts",
    label: "Advanced Charts",
    bgClass: "bg-[linear-gradient(180deg,#0c1530,#091230)]",
  },
  {
    variant: "signals",
    label: "Signal Feed",
    bgClass: "bg-[linear-gradient(180deg,#0d1633,#091025)]",
  },
];

export function Highlights() {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="m-0 text-lg font-bold tracking-[-0.01em] text-ink">
          Highlights
        </h2>
      </div>

      <div
        className={cn(
          "rounded-2xl border border-line bg-surface px-6 pb-7 pt-6 shadow-card",
          "max-lg:p-4",
        )}
      >
        <h3 className="mb-[18px] text-center text-sm font-extrabold uppercase tracking-[0.16em] text-ink">
          Upcoming Features &amp; Premium Tools
        </h3>

        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1 max-lg:gap-3">
          {CARDS.map((card) => (
            <div
              key={card.variant}
              className={cn(
                "flex flex-col overflow-hidden rounded-xl border border-line bg-surface-2",
                "transition-[transform,border-color] duration-150",
                "hover:-translate-y-0.5 hover:border-gold/40",
              )}
            >
              <div
                className={cn(
                  "relative overflow-hidden border-b border-line",
                  "aspect-[16/10]",
                  card.bgClass,
                )}
              >
                <ChartPreview variant={card.variant} />
              </div>
              <div
                className={cn(
                  "py-2.5 text-center text-xs font-extrabold uppercase tracking-[0.14em]",
                  "text-[#1a1208]",
                  "bg-[linear-gradient(180deg,var(--gold-2),var(--gold-3))]",
                )}
              >
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
