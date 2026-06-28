/**
 * Single source of truth for the markets list shown in the picker.
 *
 * Hand-curated for V1. Once the Trading service `/markets` endpoint lands,
 * fetch this into a `useMarkets()` hook and let the picker render from
 * server-pushed data without otherwise changing.
 */

export type MarketCategoryId =
  | "favorites"
  | "stock_indices"
  | "derived"
  | "cryptocurrencies"
  | "forex"
  | "commodities";

export type MarketSubCategoryId = "baskets" | "synthetics";

/** Visual group inside a category's right pane (e.g. "Crash/Boom"). */
export interface MarketGroup {
  id: string;
  label: string;
  marketIds: string[];
}

export interface MarketCategory {
  id: MarketCategoryId;
  label: string;
  /** Optional expandable sub-items shown under the rail row. */
  subCategories?: { id: MarketSubCategoryId; label: string }[];
  /** Groups rendered in the right pane (ordering matters). */
  groups: MarketGroup[];
}

export interface Market {
  id: string;
  /** Human-readable name shown in the picker rows + MarketPill. */
  name: string;
  /** Tick seed price used by the simulator (replace with REST snapshot later). */
  seedPrice: number;
  category: MarketCategoryId;
  /** Optional sub-category for hierarchical placement. */
  subCategory?: MarketSubCategoryId;
  /** Market is currently unavailable (shows a red "CLOSED" badge, §5). */
  closed?: boolean;
}

// ─── Markets ────────────────────────────────────────────────────────────────
export const MARKETS: Record<string, Market> = {
  // Derived → Synthetics (Volatility + Crash/Boom + Jump + Daily reset + Bull/Bear)
  vol_100_1s: { id: "vol_100_1s", name: "Volatility 100 (1s) Index", seedPrice: 1017.65, category: "derived", subCategory: "synthetics" },
  vol_75_1s:  { id: "vol_75_1s",  name: "Volatility 75 (1s) Index",  seedPrice: 856.21,  category: "derived", subCategory: "synthetics" },
  vol_50_1s:  { id: "vol_50_1s",  name: "Volatility 50 (1s) Index",  seedPrice: 412.88,  category: "derived", subCategory: "synthetics" },
  vol_25_1s:  { id: "vol_25_1s",  name: "Volatility 25 (1s) Index",  seedPrice: 218.45,  category: "derived", subCategory: "synthetics" },
  boom_1000:  { id: "boom_1000",  name: "Boom 1000 Index", seedPrice: 6843.22, category: "derived", subCategory: "synthetics" },
  boom_500:   { id: "boom_500",   name: "Boom 500 Index",  seedPrice: 9412.07, category: "derived", subCategory: "synthetics" },
  crash_1000: { id: "crash_1000", name: "Crash 1000 Index", seedPrice: 7621.45, category: "derived", subCategory: "synthetics" },
  crash_500:  { id: "crash_500",  name: "Crash 500 Index",  seedPrice: 5310.18, category: "derived", subCategory: "synthetics" },
  jump_10:    { id: "jump_10",    name: "Jump 10 Index",  seedPrice: 11045.5, category: "derived", subCategory: "synthetics" },
  jump_25:    { id: "jump_25",    name: "Jump 25 Index",  seedPrice: 9876.2,  category: "derived", subCategory: "synthetics" },
  bull_market: { id: "bull_market", name: "Bull Market Index", seedPrice: 612.4, category: "derived", subCategory: "synthetics" },
  bear_market: { id: "bear_market", name: "Bear Market Index", seedPrice: 489.7, category: "derived", subCategory: "synthetics" },

  // Cryptocurrencies
  btc_usd: { id: "btc_usd", name: "BTC/USD", seedPrice: 67843.20, category: "cryptocurrencies" },
  eth_usd: { id: "eth_usd", name: "ETH/USD", seedPrice: 3782.55,  category: "cryptocurrencies" },
  sol_usd: { id: "sol_usd", name: "SOL/USD", seedPrice: 142.18,   category: "cryptocurrencies" },

  // Forex
  eur_usd: { id: "eur_usd", name: "EUR/USD", seedPrice: 1.0875, category: "forex" },
  gbp_usd: { id: "gbp_usd", name: "GBP/USD", seedPrice: 1.2654, category: "forex" },
  usd_jpy: { id: "usd_jpy", name: "USD/JPY", seedPrice: 152.34, category: "forex" },

  // Commodities
  xau_usd: { id: "xau_usd", name: "Gold/USD",   seedPrice: 2348.50, category: "commodities" },
  xag_usd: { id: "xag_usd", name: "Silver/USD", seedPrice: 28.42,   category: "commodities" },

  // Stock indices — closed outside exchange hours (demo CLOSED badge, §5).
  spx: { id: "spx", name: "S&P 500", seedPrice: 5234.18, category: "stock_indices", closed: true },
  ndx: { id: "ndx", name: "NASDAQ 100", seedPrice: 18421.7, category: "stock_indices", closed: true },
};

// ─── Categories with groupings ─────────────────────────────────────────────
export const CATEGORIES: MarketCategory[] = [
  {
    id: "favorites",
    label: "Favorites",
    groups: [], // populated at runtime from useFavoriteMarkets
  },
  {
    id: "stock_indices",
    label: "Stock indices",
    groups: [{ id: "indices", label: "Indices", marketIds: ["spx", "ndx"] }],
  },
  {
    id: "derived",
    label: "Derived",
    subCategories: [
      { id: "baskets", label: "Baskets" },
      { id: "synthetics", label: "Synthetics" },
    ],
    groups: [
      {
        id: "crash_boom",
        label: "Crash/Boom",
        marketIds: ["boom_1000", "boom_500", "crash_1000", "crash_500"],
      },
      {
        id: "daily_reset",
        label: "Daily reset indices",
        marketIds: ["bull_market", "bear_market"],
      },
      {
        id: "jump",
        label: "Jump indices",
        marketIds: ["jump_10", "jump_25"],
      },
      {
        id: "volatility",
        label: "Continuous indices",
        marketIds: ["vol_100_1s", "vol_75_1s", "vol_50_1s", "vol_25_1s"],
      },
    ],
  },
  {
    id: "cryptocurrencies",
    label: "Cryptocurrencies",
    groups: [
      { id: "crypto", label: "Cryptos", marketIds: ["btc_usd", "eth_usd", "sol_usd"] },
    ],
  },
  {
    id: "forex",
    label: "Forex",
    groups: [
      { id: "major", label: "Major pairs", marketIds: ["eur_usd", "gbp_usd", "usd_jpy"] },
    ],
  },
  {
    id: "commodities",
    label: "Commodities",
    groups: [
      { id: "metals", label: "Metals", marketIds: ["xau_usd", "xag_usd"] },
    ],
  },
];

export function findMarket(id: string): Market | undefined {
  return MARKETS[id];
}

/** Plain array of all markets — for search. */
export const ALL_MARKETS: Market[] = Object.values(MARKETS);
