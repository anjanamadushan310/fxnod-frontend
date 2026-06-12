"use client";

import { useEffect, useState } from "react";

export interface TickState {
  value: number;
  /** Direction of last update: +1, -1, or 0 on initial / no change. */
  dir: -1 | 0 | 1;
  /** Monotonic counter — useful as a dependency to re-trigger animations. */
  pulse: number;
}

/**
 * Simulates a live ticking value (price, balance) for UI preview.
 *
 * Once real WebSocket prices land we replace this hook with a server-fed
 * stream — the shape stays the same so call sites don't change.
 */
export function useTicking(
  seed: number,
  enabled: boolean,
  intervalMs = 1800,
): TickState {
  const [state, setState] = useState<TickState>({
    value: seed,
    dir: 0,
    pulse: 0,
  });

  // Reset whenever seed changes (e.g. switching real ↔ demo accounts).
  useEffect(() => {
    setState({ value: seed, dir: 0, pulse: 0 });
  }, [seed]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setState((prev) => {
        const drift =
          (Math.random() - 0.48) * Math.max(0.4, prev.value * 0.0008);
        const next = Math.max(0, prev.value + drift);
        const sign = Math.sign(drift) as -1 | 0 | 1;
        return { value: next, dir: sign, pulse: prev.pulse + 1 };
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);

  return state;
}
