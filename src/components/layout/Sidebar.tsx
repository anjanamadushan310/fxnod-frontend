"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BellIcon,
  BarsIcon,
  ChatIcon,
  ChevronIcon,
  FolderIcon,
  HelpIcon,
  HomeIcon,
  OptionsIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

/**
 * Sidebar keys still drive MobileTabBar + tests. Some keys map to routes
 * (home, options …), others are pure UI actions (chat, wa, help) that don't
 * change the URL — those use `onSelect` instead of `href`.
 */
export type SidebarKey =
  | "home"
  | "cfds"
  | "options"
  | "portfolio"
  | "chat"
  | "wa"
  | "help";

interface NavItem {
  key: SidebarKey;
  label: string;
  icon: ReactNode;
  href?: string;
}

const PRIMARY: NavItem[] = [
  { key: "home", label: "Home", icon: <HomeIcon className="h-[18px] w-[18px]" />, href: "/home" },
  { key: "cfds", label: "CFDs", icon: <BarsIcon className="h-[18px] w-[18px]" /> },
  { key: "options", label: "Options", icon: <OptionsIcon className="h-[18px] w-[18px]" />, href: "/options" },
  { key: "portfolio", label: "Portfolio", icon: <FolderIcon className="h-[18px] w-[18px]" /> },
];

const SUPPORT: NavItem[] = [
  { key: "chat", label: "Live chat", icon: <ChatIcon className="h-[18px] w-[18px]" /> },
  { key: "wa", label: "WhatsApp", icon: <WhatsAppIcon className="h-[18px] w-[18px]" /> },
  { key: "help", label: "Help centre", icon: <HelpIcon className="h-[18px] w-[18px]" /> },
];

interface SidebarProps {
  /** Fallback active key for items without an `href`. Pathname wins for routed items. */
  active?: SidebarKey;
  /** Called when a non-routed item is clicked. */
  onSelect?: (key: SidebarKey) => void;
  user?: { initials: string; name: string; email: string };
}

export function Sidebar({
  active,
  onSelect,
  user = {
    initials: "SD",
    name: "Saman Deshapriya",
    email: "popandpcff@gmail.com",
  },
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.href) return pathname?.startsWith(item.href) ?? false;
    return active === item.key;
  };

  return (
    <aside
      className={cn(
        "sticky top-[96px] flex h-[calc(100vh-116px)] flex-col gap-[18px] self-start pr-2",
        "max-lg:hidden",
      )}
    >
      <div className="flex items-center justify-between px-1.5 pt-1">
        <span className="text-xs font-extrabold tracking-[0.14em] text-ink-2">
          FXNOD
        </span>
        <button
          type="button"
          aria-label="Notifications"
          className={cn(
            "relative grid h-8 w-8 place-items-center rounded-full",
            "border border-line bg-surface text-ink-2",
          )}
        >
          <BellIcon className="h-3.5 w-3.5" />
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full bg-gold"
            style={{ boxShadow: "0 0 0 2px var(--bg)" }}
          />
        </button>
      </div>

      <NavList items={PRIMARY} isActive={isActive} onSelect={onSelect} />

      <div className="mx-2 h-px bg-line" />

      <NavList items={SUPPORT} isActive={isActive} onSelect={onSelect} />

      <div className="mt-auto flex items-center gap-2.5 border-t border-line p-2.5">
        <div
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full text-[13px] font-extrabold tracking-[0.04em]",
            "text-[#0a1430]",
            "bg-[linear-gradient(135deg,#d9b663,#a98639)]",
          )}
          style={{
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.4) inset, 0 2px 6px rgba(169,134,57,0.4)",
          }}
        >
          {user.initials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <b className="text-[13px] font-bold text-ink">{user.name}</b>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-ink-3">
            {user.email}
          </span>
        </div>
        <ChevronIcon className="h-3.5 w-3.5 text-ink-3" />
      </div>
    </aside>
  );
}

function NavList({
  items,
  isActive,
  onSelect,
}: {
  items: NavItem[];
  isActive: (item: NavItem) => boolean;
  onSelect?: (key: SidebarKey) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-1">
      {items.map((item) => {
        const active = isActive(item);
        const cls = cn(
          "flex items-center gap-3 rounded-lg px-2.5 py-[9px] text-left text-sm font-medium",
          "transition-colors",
          active
            ? "bg-surface text-ink font-semibold shadow-[0_0_0_1px_var(--line),0_1px_2px_rgba(10,20,48,0.04)]"
            : "text-ink-2 hover:bg-surface-2 hover:text-ink",
        );
        const iconWrap = (
          <span
            className={cn(
              "flex-none",
              active ? "text-gold-3 dark:text-gold-2" : "text-ink-3",
            )}
          >
            {item.icon}
          </span>
        );

        if (item.href) {
          return (
            <Link key={item.key} href={item.href as Route} className={cls}>
              {iconWrap}
              {item.label}
            </Link>
          );
        }
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect?.(item.key)}
            className={cls}
          >
            {iconWrap}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
