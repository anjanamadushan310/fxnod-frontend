"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

interface WatermarkProps {
  /** 0–1 opacity (default ~0.28 per design). */
  intensity?: number;
}

/**
 * The gold geometric shield + ascending bars + rising arrow that floats
 * behind the main content. Driven by the `--wm-opacity` CSS variable so
 * the user-tweakable intensity from settings can adjust it live.
 */
export function Watermark({ intensity = 0.28 }: WatermarkProps) {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--wm-opacity",
      String(intensity),
    );
  }, [intensity]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 top-[120px] -translate-x-1/2",
        "h-[540px] w-[540px] text-gold",
        "max-lg:h-[360px] max-lg:w-[360px]",
      )}
      style={{
        opacity: "var(--wm-opacity, 0.28)",
        filter: "drop-shadow(0 4px 24px rgba(201,162,78,0.15))",
      }}
    >
      <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
        <defs>
          <linearGradient id="wmShield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="wmBar" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.7" />
            <stop offset="1" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Outer shield — thick stroke */}
        <path
          d="M100 10 L176 36 V94 C176 140 146 172 100 188 C54 172 24 140 24 94 V36 Z"
          stroke="url(#wmShield)"
          strokeWidth="5"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Inner shield — thin accent */}
        <path
          d="M100 22 L164 44 V94 C164 134 138 162 100 176 C62 162 36 134 36 94 V44 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
          opacity="0.55"
        />

        {/* Ascending bars */}
        <rect x="56" y="120" width="16" height="36" rx="2" fill="url(#wmBar)" opacity="0.7" />
        <rect x="78" y="100" width="16" height="56" rx="2" fill="url(#wmBar)" opacity="0.85" />
        <rect x="100" y="80" width="16" height="76" rx="2" fill="url(#wmBar)" />
        <rect x="122" y="56" width="16" height="100" rx="2" fill="url(#wmBar)" />

        {/* Rising arrow */}
        <path
          d="M50 88 L86 100 L110 78 L150 38"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M134 32 L156 32 L156 54"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
