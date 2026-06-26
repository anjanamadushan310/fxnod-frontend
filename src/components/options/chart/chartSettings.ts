/**
 * Single source of truth for the chart's URL-driven settings.
 *
 * The chart UI is steered entirely by two query params on /options:
 *
 *   ?chart_type=area&interval=1m
 *
 * Everything here is pure (no React) so it can be shared by the hook
 * (`useChartSettings`), the popover (`ChartSettingsPopover`) and the
 * renderer (`ChartCanvas`) without circular deps.
 */

import { findMarket } from "../market/catalog";
import { CONTRACT_TYPES, type ContractTypeId } from "../layout/contractTypes";

export type ChartTypeId = "area" | "candle" | "hollow" | "ohlc";

/**
 * The trading contract type (Rise/Fall, Accumulators, …). We deliberately
 * alias the existing `ContractTypeId` rather than re-declare the union here —
 * `CONTRACT_TYPES` in `../layout/contractTypes` is the single source of truth
 * that also drives the tab bar, so the URL and the tabs can never drift.
 */
export type TradeTypeId = ContractTypeId;

export type IntervalId =
  | "1t"
  | "1m"
  | "2m"
  | "3m"
  | "5m"
  | "10m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "8h"
  | "1d";

export const CHART_TYPES: { id: ChartTypeId; label: string }[] = [
  { id: "area", label: "Area" },
  { id: "candle", label: "Candle" },
  { id: "hollow", label: "Hollow" },
  { id: "ohlc", label: "OHLC" },
];

export const INTERVALS: { id: IntervalId; label: string }[] = [
  { id: "1t", label: "1 tick" },
  { id: "1m", label: "1 minute" },
  { id: "2m", label: "2 minutes" },
  { id: "3m", label: "3 minutes" },
  { id: "5m", label: "5 minutes" },
  { id: "10m", label: "10 minutes" },
  { id: "15m", label: "15 minutes" },
  { id: "30m", label: "30 minutes" },
  { id: "1h", label: "1 hour" },
  { id: "2h", label: "2 hours" },
  { id: "4h", label: "4 hours" },
  { id: "8h", label: "8 hours" },
  { id: "1d", label: "1 day" },
];

/** URL defaults — match the Vela/Deriv "Area + 1 tick" first paint. */
export const DEFAULT_CHART_TYPE: ChartTypeId = "area";
export const DEFAULT_INTERVAL: IntervalId = "1t";
/** Default market shown when `?symbol=` is absent or unknown. */
export const DEFAULT_SYMBOL = "vol_100_1s";
/** Default contract type when `?trade_type=` is absent or unknown. */
export const DEFAULT_TRADE_TYPE: TradeTypeId = "rise_fall";

const CHART_TYPE_IDS = new Set<string>(CHART_TYPES.map((c) => c.id));
const INTERVAL_IDS = new Set<string>(INTERVALS.map((i) => i.id));
const TRADE_TYPE_IDS = new Set<string>(CONTRACT_TYPES.map((t) => t.id));

/** Coerce an untrusted `?chart_type=` value to a known id (or the default). */
export function parseChartType(raw: string | null | undefined): ChartTypeId {
  return raw && CHART_TYPE_IDS.has(raw)
    ? (raw as ChartTypeId)
    : DEFAULT_CHART_TYPE;
}

/** Coerce an untrusted `?interval=` value to a known id (or the default). */
export function parseInterval(raw: string | null | undefined): IntervalId {
  return raw && INTERVAL_IDS.has(raw) ? (raw as IntervalId) : DEFAULT_INTERVAL;
}

/**
 * Coerce an untrusted `?symbol=` value to a known market id (or the default).
 * Validated against the live catalog so a stale/garbage symbol can't break
 * the page after a deploy that drops a market.
 */
export function parseSymbol(raw: string | null | undefined): string {
  return raw && findMarket(raw) ? raw : DEFAULT_SYMBOL;
}

/** Coerce an untrusted `?trade_type=` value to a known id (or the default). */
export function parseTradeType(raw: string | null | undefined): TradeTypeId {
  return raw && TRADE_TYPE_IDS.has(raw)
    ? (raw as TradeTypeId)
    : DEFAULT_TRADE_TYPE;
}

/**
 * Short label rendered on the tool-strip trigger button (e.g. "1T", "5m").
 * Tick intervals use the upper-case "T" suffix to match the Deriv design.
 */
export function intervalShortLabel(id: IntervalId): string {
  return id === "1t" ? "1T" : id;
}

/**
 * How many raw ticks collapse into one candle for the candle/hollow/OHLC
 * renderers. Larger intervals → fatter buckets → fewer, wider candles.
 *
 * The synthetic price stream ticks ~1/sec, so these are tuned to keep a
 * readable number of candles inside the 120-point rolling window rather
 * than being literal wall-clock conversions.
 */
export function candleBucketSize(id: IntervalId): number {
  switch (id) {
    case "1t":
      return 2;
    case "1m":
      return 4;
    case "2m":
      return 5;
    case "3m":
      return 6;
    case "5m":
      return 8;
    case "10m":
      return 10;
    case "15m":
      return 12;
    case "30m":
      return 15;
    default:
      return 20; // 1h and above
  }
}
