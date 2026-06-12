"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BarsIcon,
  FolderIcon,
  HomeIcon,
  OptionsIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import type { SidebarKey } from "./Sidebar";

interface Tab {
  key: SidebarKey;
  label: string;
  icon: ReactNode;
  href?: string;
}

const TABS: Tab[] = [
  { key: "home", label: "Home", icon: <HomeIcon className="h-5 w-5" />, href: "/home" },
  { key: "cfds", label: "CFDs", icon: <BarsIcon className="h-5 w-5" /> },
  { key: "options", label: "Options", icon: <OptionsIcon className="h-5 w-5" />, href: "/options" },
  { key: "portfolio", label: "Portfolio", icon: <FolderIcon className="h-5 w-5" /> },
];

interface MobileTabBarProps {
  /** Fallback active for non-routed tabs. Routed tabs derive from pathname. */
  active?: SidebarKey;
  onSelect?: (key: SidebarKey) => void;
}

export function MobileTabBar({ active, onSelect }: MobileTabBarProps) {
  const pathname = usePathname();
  const isOn = (tab: Tab) =>
    tab.href ? pathname?.startsWith(tab.href) ?? false : active === tab.key;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 hidden justify-around",
        "border-t border-gold/20",
        "bg-[rgba(10,21,53,0.95)] backdrop-blur-xl",
        "max-lg:flex",
        "pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))]",
      )}
    >
      {TABS.map((tab) => {
        const on = isOn(tab);
        const cls = cn(
          "flex flex-col items-center gap-1 border-0 bg-transparent text-[10px] font-semibold tracking-[0.06em]",
          on ? "text-gold" : "text-[#f4eedb]/60",
        );
        if (tab.href) {
          return (
            <Link key={tab.key} href={tab.href as Route} className={cls}>
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        }
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelect?.(tab.key)}
            className={cls}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
