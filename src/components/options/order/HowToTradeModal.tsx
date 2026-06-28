"use client";

import { useEffect } from "react";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/cn";

const TEAL = "#00A79E";

interface DirectionSection {
  title: string;
  description: React.ReactNode;
  /** Exit price callout shown in the diagram placeholder (last digit bolded). */
  exit: string;
}

/** Per-trade-type help content (Even/Odd fully fleshed out per §7.1). */
const CONTENT: Record<
  string,
  { intro: React.ReactNode; sections: DirectionSection[]; video: string }
> = {
  "Even/Odd": {
    intro: (
      <>
        Even/Odd lets you predict if the last digit of the last tick&apos;s price
        will be an even or odd number at contract{" "}
        <Glossary>expiry</Glossary> (<Glossary>exit spot</Glossary>).
      </>
    ),
    sections: [
      {
        title: "Even",
        description: (
          <>
            Earn a <Glossary>payout</Glossary> if the last digit of the exit spot
            is even (0, 2, 4, 6, or 8).
          </>
        ),
        exit: "1900.02",
      },
      {
        title: "Odd",
        description: (
          <>
            Earn a <Glossary>payout</Glossary> if the last digit of the exit spot
            is odd (1, 3, 5, 7, or 9).
          </>
        ),
        exit: "1900.03",
      },
    ],
    video: "Digits Even",
  },
};

interface HowToTradeModalProps {
  contractLabel: string;
  onClose: () => void;
}

/**
 * "How to trade [X]?" help modal (Deriv §7.1). Fixed header (title + close),
 * scrollable body (intro + per-direction sections with animated-diagram
 * placeholders + an embedded video placeholder), fixed "Got it" footer.
 */
export function HowToTradeModal({
  contractLabel,
  onClose,
}: HowToTradeModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const content = CONTENT[contractLabel] ?? genericContent(contractLabel);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`How to trade ${contractLabel}`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-[min(640px,calc(100vh-32px))] w-[min(460px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-opt-line bg-opt-bg-elev shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        {/* Fixed header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-opt-line px-5 py-4">
          <h2 className="text-[17px] font-bold text-opt-ink">{contractLabel}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-opt-ink-3 transition-colors hover:bg-opt-bg-sunk hover:text-opt-ink"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
          <p className="text-[13.5px] leading-relaxed text-opt-ink-2">
            {content.intro}
          </p>

          {content.sections.map((s) => (
            <section key={s.title} className="flex flex-col gap-2">
              <h3 className="text-[14px] font-bold text-opt-ink">{s.title}</h3>
              <p className="text-[13px] leading-relaxed text-opt-ink-2">
                {s.description}
              </p>
              <DiagramPlaceholder label={s.title} exit={s.exit} />
            </section>
          ))}

          <VideoPlaceholder title={content.video} />
        </div>

        {/* Fixed footer */}
        <div className="flex-shrink-0 border-t border-opt-line p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-opt-ink py-3 text-[14px] font-semibold text-opt-bg transition-[filter] hover:brightness-110"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function Glossary({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: TEAL }} className="cursor-help font-medium underline decoration-dotted underline-offset-2">
      {children}
    </span>
  );
}

/** Animated-diagram stand-in: Start → Expiry chart with the exit-price pill. */
function DiagramPlaceholder({ label, exit }: { label: string; exit: string }) {
  const lastDigit = exit.slice(-1);
  return (
    <div className="relative h-[120px] overflow-hidden rounded-xl border border-opt-line bg-opt-bg-sunk">
      <span className="absolute left-3 top-2 text-[11px] font-semibold text-opt-ink-3">
        {label}
      </span>
      {/* dashed "start time" / solid "expiry time" verticals */}
      <span className="absolute bottom-5 left-8 top-6 w-px border-l border-dashed border-opt-ink-4" />
      <span className="absolute bottom-5 right-16 top-6 w-px" style={{ borderLeft: `2px solid ${TEAL}` }} />
      {/* price line stand-in */}
      <svg viewBox="0 0 200 80" className="absolute inset-x-0 bottom-4 h-16 w-full" preserveAspectRatio="none">
        <path d="M10 50 L60 40 L110 55 L150 30" fill="none" stroke="var(--opt-ink)" strokeWidth="1.5" />
        <circle cx="150" cy="30" r="4" fill={TEAL} />
      </svg>
      {/* exit price pill */}
      <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-[#FF4444] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">
        {exit.slice(0, -1)}
        <span className="underline">{lastDigit}</span>
      </span>
    </div>
  );
}

/** Embedded-video stand-in (Deriv-branded thumbnail + play button). */
function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="relative grid h-[160px] place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0a1430] to-[#13204a]">
      <span className="absolute left-3 top-3 text-[12px] font-bold text-white/90">
        deriv
      </span>
      <span className="absolute right-4 top-4 h-6 w-6 rounded bg-[#00A79E]/70" />
      <span className="absolute bottom-4 right-6 h-5 w-5 rounded bg-[#FF4444]/70" />
      <span className="absolute left-4 bottom-4 text-[16px] font-bold text-white">
        {title}
      </span>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-black/70 text-white">
        <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
      </span>
    </div>
  );
}

function genericContent(label: string) {
  return {
    intro: (
      <>Learn how the {label} contract works and when it pays out.</>
    ),
    sections: [
      { title: label, description: <>Placeholder explainer for {label}.</>, exit: "1900.00" },
    ],
    video: label,
  };
}
