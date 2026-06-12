/**
 * Visual placeholder QR — 21x21 grid with deterministic noise + finder
 * patterns. Doesn't actually scan; swap for a real QR generator when the
 * mobile app URLs are real.
 *
 * Deterministic by `seed` so SSR + client always produce identical markup.
 */
import { useMemo } from "react";

interface FauxQRProps {
  seed?: number;
}

export function FauxQR({ seed = 1 }: FauxQRProps) {
  const cells = useMemo(() => buildCells(seed), [seed]);
  return (
    <svg viewBox="0 0 21 21" shapeRendering="crispEdges" className="h-full w-full">
      <rect width="21" height="21" fill="#fff" />
      {cells.map(({ x, y, k }) => (
        <rect key={k} x={x} y={y} width="1" height="1" fill="#0a1535" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={14} y={0} />
      <Finder x={0} y={14} />
    </svg>
  );
}

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width="7" height="7" fill="#0a1535" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" fill="#0a1535" />
    </g>
  );
}

function buildCells(seed: number) {
  const N = 21;
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);

  const cells: { x: number; y: number; k: string }[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (inFinder(r, c)) continue;
      if (rnd() > 0.5) cells.push({ x: c, y: r, k: `${r}-${c}` });
    }
  }
  return cells;
}
