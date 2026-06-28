"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Top-level layout for /options.
 *
 * 4-column grid: [icon sidebar 76] [positions drawer 0↔360] [chart 1fr]
 * [order panel 340]. The drawer column animates between 0 and 360px, so the
 * chart (1fr) **compresses** smoothly instead of being overlaid — and the
 * LiveChart ResizeObserver fires throughout the transition to resize the
 * canvas.
 *
 * The wrapper carries `data-app="options"` so the scoped CSS-variable tokens
 * (--opt-bg, --opt-ink, --opt-rise, …) take effect inside this subtree only.
 */
interface OptionsShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  main: React.ReactNode;
  order: React.ReactNode;
  /** Positions drawer content — rendered in the (clipped) drawer column. */
  drawer?: React.ReactNode;
  /** Open state drives the drawer column width animation. */
  drawerOpen?: boolean;
  /** Light = default, "dark" flips the scoped dark tokens. */
  theme?: "light" | "dark";
}

export function OptionsShell({
  sidebar,
  topbar,
  main,
  order,
  drawer,
  drawerOpen = false,
  theme: themeProp,
}: OptionsShellProps) {
  // Theme as local state so the sidebar's sun/moon toggle can flip it later.
  const [theme, _setTheme] = useState<"light" | "dark">(themeProp ?? "light");

  return (
    <div
      data-app="options"
      data-opt-theme={theme}
      className={cn(
        "fixed inset-0 grid overflow-hidden",
        // rows: topbar 64 / rest
        "grid-rows-[64px_1fr]",
        // cols: sidebar 76 / drawer 0↔360 / chart 1fr / order 340 — animated.
        "transition-[grid-template-columns] duration-300 ease-out",
        drawerOpen
          ? "grid-cols-[76px_360px_1fr_340px]"
          : "grid-cols-[76px_0px_1fr_340px]",
        "bg-opt-bg font-sans text-opt-ink",
      )}
    >
      {/* Sidebar — spans both rows */}
      <div className="row-span-2 border-r border-opt-line bg-opt-bg-elev">
        {sidebar}
      </div>

      {/* Top bar — spans drawer + chart + order columns (left edge fixed at 76) */}
      <div className="col-start-2 col-span-3 row-start-1 border-b border-opt-line bg-opt-bg">
        {topbar}
      </div>

      {/* Positions drawer column — clipped to its (animating) width */}
      <div className="col-start-2 row-start-2 overflow-hidden">{drawer}</div>

      {/* Chart column — 1fr, compresses as the drawer column grows */}
      <div className="col-start-3 row-start-2 flex min-h-0 min-w-0 flex-col">
        {main}
      </div>

      {/* Right-side order panel */}
      <aside className="col-start-4 row-start-2 flex min-h-0 flex-col overflow-y-auto border-l border-opt-line bg-opt-bg">
        {order}
      </aside>
    </div>
  );
}
