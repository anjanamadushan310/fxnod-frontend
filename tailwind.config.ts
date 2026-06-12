import type { Config } from "tailwindcss";

/**
 * Tailwind is configured to read the design tokens from CSS variables
 * (defined in `src/app/globals.css`). This keeps the FXNod theme — navy,
 * gold, light/dark — switchable from a single place.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        navy: "var(--navy)",
        "navy-2": "var(--navy-2)",
        "navy-3": "var(--navy-3)",
        gold: "var(--gold)",
        "gold-2": "var(--gold-2)",
        "gold-3": "var(--gold-3)",
        "gold-soft": "var(--gold-soft)",

        // /options scope — only meaningful inside [data-app="options"].
        "opt-bg": "var(--opt-bg)",
        "opt-bg-elev": "var(--opt-bg-elev)",
        "opt-bg-sunk": "var(--opt-bg-sunk)",
        "opt-line": "var(--opt-line)",
        "opt-line-strong": "var(--opt-line-strong)",
        "opt-ink": "var(--opt-ink)",
        "opt-ink-2": "var(--opt-ink-2)",
        "opt-ink-3": "var(--opt-ink-3)",
        "opt-ink-4": "var(--opt-ink-4)",
        "opt-rise": "var(--opt-rise)",
        "opt-rise-soft": "var(--opt-rise-soft)",
        "opt-fall": "var(--opt-fall)",
        "opt-fall-soft": "var(--opt-fall-soft)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        nav: "var(--shadow-nav)",
      },
    },
  },
  plugins: [],
};

export default config;
