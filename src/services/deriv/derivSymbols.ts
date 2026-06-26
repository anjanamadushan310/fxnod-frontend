/**
 * Mapping layer between the FXNod catalog and the Deriv WebSocket API.
 *
 * Our UI speaks catalog ids ("vol_100_1s") and interval ids ("1t", "5m");
 * Deriv speaks its own symbol codes ("1HZ100V") and candle granularities in
 * seconds. Everything that translates between the two lives here so the feed
 * hook and chart component stay protocol-agnostic.
 */

import queryString from "query-string";
import type { ChartTypeId, IntervalId } from "@/components/options/chart/chartSettings";

// ─── Connection config ───────────────────────────────────────────────────────
// Deriv's market-data streams (ticks / candles) are public — no OAuth/OTP. The
// app_id MUST come from the environment (.env.local: NEXT_PUBLIC_DERIV_APP_ID);
// 1089 is only a last-resort dev fallback so a missing var doesn't hard-crash.
const DERIV_WS_BASE =
  process.env.NEXT_PUBLIC_DERIV_WS_URL ?? "wss://ws.derivws.com/websockets/v3";

function resolveAppId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_DERIV_APP_ID;
  if (fromEnv && fromEnv.trim() !== "") return fromEnv;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[deriv] NEXT_PUBLIC_DERIV_APP_ID is not set — falling back to the shared " +
        "test app_id 1089. Add it to .env.local.",
    );
  }
  return "1089";
}

const DERIV_APP_ID = resolveAppId();

/** Full WS endpoint incl. the app_id query (built with query-string). */
export function derivWsUrl(): string {
  return `${DERIV_WS_BASE}?${queryString.stringify({
    app_id: DERIV_APP_ID,
    l: "en",
    brand: "deriv",
  })}`;
}

// ─── Symbol mapping (catalog id → Deriv symbol) ──────────────────────────────
// Best-effort. Markets Deriv doesn't list (e.g. SOL/USD) are intentionally
// absent — the feed surfaces "unsupported" rather than subscribing to junk.
const CATALOG_TO_DERIV: Record<string, string> = {
  // Derived → Synthetics
  vol_100_1s: "1HZ100V",
  vol_75_1s: "1HZ75V",
  vol_50_1s: "1HZ50V",
  vol_25_1s: "1HZ25V",
  boom_1000: "BOOM1000",
  boom_500: "BOOM500",
  crash_1000: "CRASH1000",
  crash_500: "CRASH500",
  jump_10: "JD10",
  jump_25: "JD25",
  bull_market: "RDBULL",
  bear_market: "RDBEAR",

  // Cryptocurrencies
  btc_usd: "cryBTCUSD",
  eth_usd: "cryETHUSD",

  // Forex
  eur_usd: "frxEURUSD",
  gbp_usd: "frxGBPUSD",
  usd_jpy: "frxUSDJPY",

  // Commodities
  xau_usd: "frxXAUUSD",
  xag_usd: "frxXAGUSD",

  // Stock indices
  spx: "OTC_SPC",
  ndx: "OTC_NDX",
};

/** Catalog id → Deriv symbol, or undefined if Deriv doesn't carry it. */
export function toDerivSymbol(catalogId: string): string | undefined {
  return CATALOG_TO_DERIV[catalogId];
}

// ─── Interval → candle granularity (seconds) ─────────────────────────────────
// Only the granularities Deriv accepts for `ticks_history` candles.
const INTERVAL_GRANULARITY: Record<Exclude<IntervalId, "1t">, number> = {
  "1m": 60,
  "2m": 120,
  "3m": 180,
  "5m": 300,
  "10m": 600,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
  "2h": 7200,
  "4h": 14400,
  "8h": 28800,
  "1d": 86400,
};

export type FeedStyle = "ticks" | "candles";

export interface FeedPlan {
  /** Wire format requested from Deriv. */
  style: FeedStyle;
  /** Candle width in seconds (only when style === "candles"). */
  granularity?: number;
  /** Which lightweight-charts series the chartType maps to. */
  seriesKind: "area" | "candlestick";
}

/**
 * Resolve what to actually stream given the URL's chart type + interval.
 *
 *   - chartType "area" + interval "1t"  → raw tick stream, area series
 *   - chartType "area" + interval "5m"  → 5m candles, area series of closes
 *   - chartType candle/hollow/ohlc      → candles (1t falls back to 1-min,
 *                                          since Deriv has no sub-minute candle)
 */
export function feedPlan(chartType: ChartTypeId, interval: IntervalId): FeedPlan {
  const wantsCandles = chartType !== "area";
  const seriesKind = wantsCandles ? "candlestick" : "area";

  if (interval === "1t") {
    return wantsCandles
      ? { style: "candles", granularity: 60, seriesKind }
      : { style: "ticks", seriesKind };
  }

  return {
    style: "candles",
    granularity: INTERVAL_GRANULARITY[interval],
    seriesKind,
  };
}
