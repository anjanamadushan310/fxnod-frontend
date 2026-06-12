"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Top-level layout for /options.
 *
 * 3-column grid: [icon sidebar] [main column (topbar + chart)] [order panel].
 *
 * The wrapper carries `data-app="options"` so the scoped CSS-variable tokens
 * (--opt-bg, --opt-ink, --opt-rise, …) take effect inside this subtree only —
 * the home/dashboard tokens are untouched.
 *
 * Children layout:
 *   children[0]  → IconSidebar  (renders inside grid col 1)
 *   children[1]  → TopBar       (spans col 2 + col 3, row 1)
 *   children[2]  → MainColumn   (col 2, row 2)
 *   children[3]  → OrderPanel   (col 3, row 2)
 *
 * For now we accept named slots via props instead of array indexing —
 * easier to read and refactor later.
 */
interface OptionsShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  main: React.ReactNode;
  order: React.ReactNode;
  /** Light = default, "dark" flips the scoped dark tokens. */
  theme?: "light" | "dark";
}

export function OptionsShell({
  sidebar,
  topbar,
  main,
  order,
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
        // cols: sidebar 76 / main 1fr / order 340
        "grid-cols-[76px_1fr_340px]",
        // rows: topbar 64 / rest
        "grid-rows-[64px_1fr]",
        "bg-opt-bg font-sans text-opt-ink",
      )}
    >
      {/* Sidebar — spans both rows */}
      <div className="row-span-2 border-r border-opt-line bg-opt-bg-elev">
        {sidebar}
      </div>

      {/* Top bar — spans main + order columns */}
      <div className="col-span-2 row-start-1 border-b border-opt-line bg-opt-bg">
        {topbar}
      </div>

      {/* Main column — chart area */}
      <div className="col-start-2 row-start-2 flex min-h-0 min-w-0 flex-col">
        {main}
      </div>

      {/* Right-side order panel */}
      <aside className="col-start-3 row-start-2 flex min-h-0 flex-col overflow-y-auto border-l border-opt-line bg-opt-bg">
        {order}
      </aside>
    </div>
  );
}
