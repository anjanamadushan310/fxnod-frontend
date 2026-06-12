"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type AccountMode = "real" | "demo";

interface ModeToggleProps {
  value: AccountMode;
  onChange: (mode: AccountMode) => void;
}

/**
 * Pill segmented control with a gold sliding thumb. The thumb measures its
 * target button on mount + whenever `value` changes — so it works for
 * different label widths without hardcoding pixel offsets.
 */
export function ModeToggle({ value, onChange }: ModeToggleProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number }>({
    left: 3,
    width: 70,
  });
  // Measure asynchronously so we don't trigger a paint before fonts settle.
  const measure = () => {
    const track = trackRef.current;
    if (!track) return;
    const selected = track.querySelector<HTMLButtonElement>("button.on");
    if (!selected) return;
    const trackRect = track.getBoundingClientRect();
    const selRect = selected.getBoundingClientRect();
    setThumb({ left: selRect.left - trackRect.left, width: selRect.width });
  };
  useLayoutEffect(measure, [value]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative inline-flex rounded-full border border-line bg-surface p-[3px]",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] bottom-[3px] rounded-full transition-[left,width] duration-[220ms]",
          "bg-[linear-gradient(180deg,var(--gold-2),var(--gold))]",
        )}
        style={{
          left: thumb.left,
          width: thumb.width,
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.5) inset, 0 4px 10px -4px rgba(201,162,78,0.6)",
        }}
      />
      <SegButton value={value} mine="real" onChange={onChange}>
        Real
      </SegButton>
      <SegButton value={value} mine="demo" onChange={onChange}>
        Demo
      </SegButton>
    </div>
  );
}

function SegButton({
  value,
  mine,
  onChange,
  children,
}: {
  value: AccountMode;
  mine: AccountMode;
  onChange: (m: AccountMode) => void;
  children: React.ReactNode;
}) {
  const on = value === mine;
  return (
    <button
      type="button"
      onClick={() => onChange(mine)}
      className={cn(
        "relative z-10 rounded-full border-0 bg-transparent px-[18px] py-1.5 text-xs font-semibold tracking-[0.06em]",
        "transition-colors",
        on ? "on text-[#1a1208]" : "text-ink-2",
      )}
    >
      {children}
    </button>
  );
}
