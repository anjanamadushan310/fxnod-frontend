/**
 * Contract-details model + mock data (Deriv §10).
 *
 * `ContractDetail` is the rich shape the details modal renders: metadata for
 * the left panel + the isolated tick path for the right-panel chart. The mock
 * closed contracts are deterministic (no Math.random / Date.now) so the
 * server and client markup match — important since the drawer is in the DOM
 * (clipped) even when closed.
 */
import type { Position } from "@/hooks/useMockPositions";

export interface ContractTick {
  /** Epoch seconds (UTCTimestamp). */
  time: number;
  value: number;
  kind: "entry" | "exit" | "normal";
}

export interface ContractDetail {
  id: string;
  marketId: string;
  marketName: string;
  /** "Rise" / "Fall" / "Up" … */
  tradeTypeLabel: string;
  side: "rise" | "fall";
  outcome: "won" | "lost";
  stake: number;
  payout: number;
  contractValue: number;
  pnl: number;
  buyPrice: number;
  sellPrice: number;
  referenceBuy: number;
  referenceSell: number;
  duration: string;
  barrier: number;
  startTime: number;
  entrySpot: number;
  entryTime: number;
  exitSpot: number;
  exitTime: number;
  ticks: ContractTick[];
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "28 Jun 2026" (UTC, deterministic). */
export function formatContractDate(epochSec: number): string {
  const d = new Date(epochSec * 1000);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "2026-06-28 20:13:42 GMT" (UTC, deterministic). */
export function formatContractTime(epochSec: number): string {
  const d = new Date(epochSec * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} GMT`
  );
}

/** Deterministic tick path from entry → exit with a fixed wiggle. */
function genTicks(
  entry: number,
  exit: number,
  startSec: number,
  n = 5,
): ContractTick[] {
  const amp = Math.max(0.2, Math.abs(exit - entry) * 0.6);
  const out: ContractTick[] = [];
  for (let i = 0; i < n; i++) {
    const frac = n > 1 ? i / (n - 1) : 0;
    const wiggle = i === 0 || i === n - 1 ? 0 : Math.sin(i * 1.7) * amp;
    out.push({
      time: startSec + i,
      value: +(entry + (exit - entry) * frac + wiggle).toFixed(
        Math.abs(entry) < 10 ? 4 : 2,
      ),
      kind: i === 0 ? "entry" : i === n - 1 ? "exit" : "normal",
    });
  }
  return out;
}

const D = (y: number, mo: number, d: number, h: number, mi: number, s: number) =>
  Math.floor(Date.UTC(y, mo - 1, d, h, mi, s) / 1000);

function mk(p: {
  id: string;
  marketId: string;
  marketName: string;
  side: "rise" | "fall";
  entry: number;
  exit: number;
  start: number;
  stake: number;
  payout: number;
  outcome: "won" | "lost";
}): ContractDetail {
  const won = p.outcome === "won";
  const pnl = won ? +(p.payout - p.stake).toFixed(2) : -p.stake;
  const contractValue = won ? p.payout : 0;
  const refBase = 4290000000 + p.id.charCodeAt(1) * 13;
  return {
    id: p.id,
    marketId: p.marketId,
    marketName: p.marketName,
    tradeTypeLabel: p.side === "rise" ? "Rise" : "Fall",
    side: p.side,
    outcome: p.outcome,
    stake: p.stake,
    payout: p.payout,
    contractValue,
    pnl,
    buyPrice: p.stake,
    sellPrice: contractValue,
    referenceBuy: refBase,
    referenceSell: refBase + 1,
    duration: "5 ticks",
    barrier: p.entry,
    startTime: p.start,
    entrySpot: p.entry,
    entryTime: p.start + 1,
    exitSpot: p.exit,
    exitTime: p.start + 5,
    ticks: genTicks(p.entry, p.exit, p.start, 5),
  };
}

/** Mock closed contracts spread over two days (newest first). */
export const MOCK_CLOSED_CONTRACTS: ContractDetail[] = [
  mk({ id: "c1", marketId: "vol_100_1s", marketName: "Volatility 100 (1s) Index", side: "rise", entry: 786.72, exit: 786.52, start: D(2026, 6, 28, 20, 13, 42), stake: 10, payout: 19.23, outcome: "lost" }),
  mk({ id: "c2", marketId: "vol_100_1s", marketName: "Volatility 100 (1s) Index", side: "fall", entry: 772.1, exit: 771.3, start: D(2026, 6, 28, 18, 2, 10), stake: 10, payout: 19.55, outcome: "won" }),
  mk({ id: "c3", marketId: "btc_usd", marketName: "BTC/USD", side: "rise", entry: 67800, exit: 67861, start: D(2026, 6, 27, 9, 30, 0), stake: 25, payout: 48.0, outcome: "won" }),
  mk({ id: "c4", marketId: "eur_usd", marketName: "EUR/USD", side: "fall", entry: 1.0875, exit: 1.0879, start: D(2026, 6, 27, 7, 15, 0), stake: 10, payout: 19.1, outcome: "lost" }),
];

/** Best-effort ContractDetail for an in-progress (sim) open position. */
export function simPositionToDetail(p: Position): ContractDetail {
  const entry = p.entrySpot ?? 0;
  const exit = +(entry + p.pnl * 0.1).toFixed(entry < 10 ? 4 : 2);
  const start = Math.floor(Date.now() / 1000) - 5;
  const won = p.pnl >= 0;
  const side = p.side === "fall" ? "fall" : "rise";
  return {
    id: p.id,
    marketId: p.marketId,
    marketName: p.marketName,
    tradeTypeLabel: side === "rise" ? "Rise" : "Fall",
    side,
    outcome: won ? "won" : "lost",
    stake: p.stake,
    payout: +(p.stake * 1.92).toFixed(2),
    contractValue: p.contractValue,
    pnl: p.pnl,
    buyPrice: p.stake,
    sellPrice: p.contractValue,
    referenceBuy: 4290000123,
    referenceSell: 0,
    duration: p.status ?? "5 ticks",
    barrier: entry,
    startTime: start,
    entrySpot: entry,
    entryTime: start + 1,
    exitSpot: exit,
    exitTime: start + 5,
    ticks: genTicks(entry, exit || entry, start, 5),
  };
}
