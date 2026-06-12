/**
 * Custom line icons matching the FXNod design (stroke-width 1.6).
 * Lifted from the home UI prototype so visual weight matches the mock.
 *
 * For one-off ad-hoc icons elsewhere, use lucide-react. Keep this file
 * dedicated to recurring nav / dashboard glyphs only.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const HomeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const BarsIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </svg>
);

export const OptionsIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="7" cy="7" r="3" />
    <circle cx="17" cy="17" r="3" />
    <path d="M14 7h6" />
    <path d="M4 17h6" />
  </svg>
);

export const FolderIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
  </svg>
);

export const ChatIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 4.2A8 8 0 0 1 21 12Z" />
  </svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M4 20l1.3-4A8 8 0 1 1 8 19l-4 1Z" />
    <path d="M9 10c.4 1.5 1.5 2.6 3 3l1-1.2c.3-.3.8-.4 1.2-.2l1.6.8c.4.2.6.7.5 1.1-.4 1.4-1.8 2.3-3.3 2.1A6 6 0 0 1 8 11c-.2-1.4.7-2.8 2-3.2.5-.1 1 .1 1.2.5l.8 1.6c.2.4.1.9-.2 1.2L10.6 12" />
  </svg>
);

export const HelpIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4" />
    <path d="M12 17h.01" />
  </svg>
);

export const BellIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const ChevronIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.8} {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const RefreshIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.8} {...base} {...p}>
    <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
    <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.8} {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={2} {...base} {...p}>
    <path d="m6 14 6-6 6 6" />
  </svg>
);

export const ArrowDownIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={2} {...base} {...p}>
    <path d="m6 10 6 6 6-6" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.8} {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

// ─── Market category icons ──────────────────────────────────────────────────
export const CryptoIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.8} {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 8v8M9 8h3.5a2 2 0 0 1 0 4H9M9 12h4a2 2 0 0 1 0 4H9" />
  </svg>
);

export const IndicesIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.8} {...base} {...p}>
    <path d="M4 18V8" />
    <path d="M10 18V4" />
    <path d="M16 18v-7" />
    <path d="m4 12 6-4 6 5 5-6" />
  </svg>
);

export const CommoditiesIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="9" cy="9" r="5" />
    <circle cx="15" cy="15" r="5" />
  </svg>
);

export const StocksIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.8} {...base} {...p}>
    <path d="M3 17V9" />
    <path d="M9 17V5" />
    <path d="M15 17v-7" />
    <path d="M21 17v-4" />
    <path d="M3 21h18" />
  </svg>
);

export const OptionsMarketIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M5 19 19 5" />
    <path d="M14 5h5v5" />
    <circle cx="7" cy="17" r="2.5" />
  </svg>
);

// ─── Options trading UI ─────────────────────────────────────────────────────

export const AppsGridIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const DocIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const GlobeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z" />
  </svg>
);

export const SunIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export const MoonIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M21 12.5A9 9 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5Z" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const InfoIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </svg>
);

export const MinusIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.8} {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const StarIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6L12 17.6 6.7 20.1l1-6L3.4 9.9 9.4 9 12 3.5Z" />
  </svg>
);

export const CaretDownIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={2} {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const CaretUpIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={2} {...base} {...p}>
    <path d="m6 15 6-6 6 6" />
  </svg>
);

export const ExpandIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M4 9V4h5" />
    <path d="M20 15v5h-5" />
    <path d="M4 4l6 6" />
    <path d="M20 20l-6-6" />
  </svg>
);

export const CenterIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
  </svg>
);

// Chart tool icons — pencil, area, candle, indicator, download
export const PencilIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const AreaChartIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M3 17V8l4 4 4-3 4 5 6-7v10Z" />
    <path d="M3 21h18" />
  </svg>
);

export const CandleChartIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M7 4v3M7 17v3M17 4v5M17 19v1" />
    <rect x="5" y="7" width="4" height="10" rx="0.5" />
    <rect x="15" y="9" width="4" height="10" rx="0.5" />
  </svg>
);

export const IndicatorIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M3 12h3l2-8 4 16 2-8h3l2 6h2" />
  </svg>
);

export const DownloadIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...base} {...p}>
    <path d="M12 4v11" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

