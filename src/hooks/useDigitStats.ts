"use client";

import { useEffect, useState } from "react";

// Seed distribution lifted from the Matches/Differs reference screenshot.
const SEED = [12.4, 10.1, 8.3, 8.8, 8.8, 10, 10.6, 10.9, 10.5, 9.6];

/**
 * Live last-digit frequency distribution (0–9) for Matches/Differs &
 * Over/Under. Each tick the percentages drift slightly and are re-normalised
 * to sum to 100, so the grid feels alive.
 *
 * Swap for the Trading service's real digit-stats stream later — the return
 * shape (length-10 number[]) stays identical.
 */
export function useDigitStats(enabled = true, intervalMs = 1500): number[] {
  const [pcts, setPcts] = useState<number[]>(SEED);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setPcts((prev) => {
        const drifted = prev.map((p) =>
          Math.max(2, p + (Math.random() - 0.5) * 0.6),
        );
        const sum = drifted.reduce((a, b) => a + b, 0);
        return drifted.map((p) => (p / sum) * 100);
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);

  return pcts;
}
