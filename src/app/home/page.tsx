"use client";

import { useState } from "react";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Sidebar, type SidebarKey } from "@/components/layout/Sidebar";
import { Watermark } from "@/components/layout/Watermark";
import { AccountsSection } from "@/components/home/AccountsSection";
import { ExploreMarkets } from "@/components/home/ExploreMarkets";
import { Highlights } from "@/components/home/Highlights";
import { MobileBanner } from "@/components/home/MobileBanner";
import { TotalValueCard } from "@/components/home/TotalValueCard";

export default function HomePage() {
  const [active, setActive] = useState<SidebarKey>("home");

  return (
    <>
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-[240px_1fr] gap-9 px-8 pb-20 pt-7 max-lg:grid-cols-1 max-lg:gap-6 max-lg:px-4 max-lg:pb-[100px] max-lg:pt-[18px]">
        <Sidebar active={active} onSelect={setActive} />

        <main className="relative flex min-w-0 flex-col gap-8">
          <Watermark intensity={0.28} />

          {/* Every direct child sits above the watermark. */}
          <div className="relative z-10 flex flex-col gap-8">
            <TotalValueCard />
            <AccountsSection />
            <ExploreMarkets />
            <Highlights />
            <MobileBanner />
          </div>
        </main>
      </div>

      <MobileTabBar active={active} onSelect={setActive} />
    </>
  );
}
