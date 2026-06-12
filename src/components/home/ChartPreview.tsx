/**
 * Faux chart previews used inside the Highlights cards. Pure SVG, no data —
 * the goal is a believable thumbnail for "Upcoming Features" cards. Replace
 * with real screenshots once the actual products ship.
 */
import { useMemo } from "react";

type Variant = "analytics" | "charts" | "signals";

interface ChartPreviewProps {
  variant: Variant;
}

export function ChartPreview({ variant }: ChartPreviewProps) {
  if (variant === "analytics") return <AnalyticsPreview />;
  if (variant === "charts") return <CandlesPreview />;
  return <SignalsPreview />;
}

function AnalyticsPreview() {
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="none"
      className="block h-full w-full"
    >
      <defs>
        <linearGradient id="prevBgA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1a3f" />
          <stop offset="1" stopColor="#0b1532" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#prevBgA)" />
      <g transform="translate(60,100)">
        <circle r="38" fill="none" stroke="#1a2a55" strokeWidth="10" />
        <circle
          r="38"
          fill="none"
          stroke="#c9a24e"
          strokeWidth="10"
          strokeDasharray="120 240"
          transform="rotate(-90)"
        />
        <circle
          r="38"
          fill="none"
          stroke="#5b8def"
          strokeWidth="10"
          strokeDasharray="60 240"
          strokeDashoffset="-120"
          transform="rotate(-90)"
        />
      </g>
      <g transform="translate(140,30)" fill="#c9a24e">
        {[40, 60, 30, 80, 50, 70, 90, 55].map((h, i) => (
          <rect
            key={i}
            x={i * 18}
            y={140 - h}
            width="12"
            height={h}
            rx="2"
            opacity={0.5 + i * 0.06}
          />
        ))}
      </g>
      <rect x="20" y="20" width="120" height="6" fill="#2a3a68" rx="2" />
      <rect x="20" y="32" width="60" height="4" fill="#1c2a52" rx="2" />
    </svg>
  );
}

function CandlesPreview() {
  // Deterministic — does not change between renders. We compute once via useMemo.
  const candles = useMemo(() => {
    const rows: {
      x: number;
      o: number;
      c: number;
      hi: number;
      lo: number;
      up: boolean;
    }[] = [];
    let y = 100;
    let s = 1;
    // Seeded pseudo-random instead of Math.random() so SSR + client agree.
    let rngState = 7;
    const rng = () => {
      rngState = (rngState * 9301 + 49297) % 233280;
      return rngState / 233280;
    };
    for (let i = 0; i < 26; i++) {
      const o = y;
      const c = y + (Math.sin(i * 0.7 + s) * 8 + (i % 3 === 0 ? -6 : 4));
      const hi = Math.min(o, c) - 6 - rng() * 4;
      const lo = Math.max(o, c) + 6 + rng() * 4;
      rows.push({ x: 12 + i * 11.5, o, c, hi, lo, up: c < o });
      y = c;
      s += 0.3;
    }
    return rows;
  }, []);

  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="none"
      className="block h-full w-full"
    >
      <rect width="320" height="200" fill="#0b1532" />
      {[40, 80, 120, 160].map((yy) => (
        <line
          key={yy}
          x1="0"
          x2="320"
          y1={yy}
          y2={yy}
          stroke="#142046"
          strokeWidth="0.5"
        />
      ))}
      {candles.map((k, i) => {
        const color = k.up ? "#3fb568" : "#d56262";
        return (
          <g key={i}>
            <line
              x1={k.x}
              x2={k.x}
              y1={k.hi}
              y2={k.lo}
              stroke={color}
              strokeWidth="1"
            />
            <rect
              x={k.x - 3.5}
              y={Math.min(k.o, k.c)}
              width="7"
              height={Math.abs(k.c - k.o) || 2}
              fill={color}
            />
          </g>
        );
      })}
      <rect x="0" y="0" width="320" height="22" fill="rgba(255,255,255,0.02)" />
      <rect x="12" y="8" width="60" height="6" fill="#2a3a68" rx="2" />
      <rect
        x="80"
        y="8"
        width="36"
        height="6"
        fill="#c9a24e"
        rx="2"
        opacity="0.7"
      />
    </svg>
  );
}

function SignalsPreview() {
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="none"
      className="block h-full w-full"
    >
      <rect width="320" height="200" fill="#0d1633" />
      <rect x="12" y="10" width="90" height="6" fill="#c9a24e" rx="2" />
      <rect x="12" y="20" width="50" height="4" fill="#2a3a68" rx="2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i} transform={`translate(0,${36 + i * 22})`}>
          <rect x="12" y="0" width="296" height="18" rx="3" fill="#142046" />
          <circle cx="22" cy="9" r="3" fill={i % 2 ? "#3fb568" : "#d56262"} />
          <rect x="32" y="5" width="80" height="3" fill="#3a4a78" rx="1" />
          <rect x="32" y="11" width="50" height="3" fill="#28365e" rx="1" />
          <rect
            x="200"
            y="5"
            width="40"
            height="9"
            rx="2"
            fill={
              i % 2 ? "rgba(63,181,104,0.25)" : "rgba(213,98,98,0.25)"
            }
            stroke={i % 2 ? "#3fb568" : "#d56262"}
            strokeWidth="0.5"
          />
          <rect
            x="250"
            y="6"
            width="50"
            height="6"
            fill="#c9a24e"
            rx="1"
            opacity="0.7"
          />
        </g>
      ))}
    </svg>
  );
}
