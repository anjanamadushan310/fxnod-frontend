"use client";

import {
  CommoditiesIcon,
  CryptoIcon,
  IndicesIcon,
  OptionsMarketIcon,
  StocksIcon,
} from "@/components/ui/Icons";
import { MarketTile, type Market } from "./MarketTile";

const MARKETS: Market[] = [
  {
    key: "cfds",
    label: "CFDs",
    symbol: "EURUSD",
    base: 1.0875,
    alt: false,
    glyph: (
      <span className="text-[13px] font-extrabold tracking-[0.04em]">
        CFDs
      </span>
    ),
  },
  {
    key: "options",
    label: "Options",
    symbol: "IV",
    base: 47.85,
    alt: false,
    glyph: <OptionsMarketIcon className="h-[30px] w-[30px]" />,
  },
  {
    key: "crypto",
    label: "Crypto",
    symbol: "BTC",
    base: 67843.2,
    alt: true,
    glyph: <CryptoIcon className="h-[30px] w-[30px]" />,
  },
  {
    key: "indices",
    label: "Indices",
    symbol: "SPX",
    base: 5234.18,
    alt: true,
    glyph: <IndicesIcon className="h-[30px] w-[30px]" />,
  },
  {
    key: "commodities",
    label: "Commodities",
    symbol: "XAU",
    base: 2348.5,
    alt: false,
    glyph: <CommoditiesIcon className="h-[30px] w-[30px]" />,
  },
  {
    key: "stocks",
    label: "Stocks",
    symbol: "TECH",
    base: 184.27,
    alt: true,
    glyph: <StocksIcon className="h-[30px] w-[30px]" />,
  },
];

interface ExploreMarketsProps {
  ticking?: boolean;
}

export function ExploreMarkets({ ticking = true }: ExploreMarketsProps) {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="m-0 text-lg font-bold tracking-[-0.01em] text-ink">
          Explore Markets
        </h2>
      </div>
      <div className="grid grid-cols-6 gap-[18px] max-lg:grid-cols-3 max-lg:gap-3">
        {MARKETS.map((market) => (
          <MarketTile key={market.key} market={market} ticking={ticking} />
        ))}
      </div>
    </section>
  );
}
