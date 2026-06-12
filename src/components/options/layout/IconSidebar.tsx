"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AppsGridIcon,
  ClockIcon,
  DocIcon,
  GlobeIcon,
  HelpIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  /** Optional red badge count (positions). */
  badge?: number | string;
  /**
   * Override the default click handler. If set, the item renders as a
   * <button> regardless of `href`.
   */
  onClick?: () => void;
  /**
   * Override the computed active state (used when active is controlled by
   * a parent — e.g. PositionsDrawer open ↔ positions row active).
   */
  controlledActive?: boolean;
}

interface IconSidebarProps {
  /** "DT" / "FX" / etc — first two letters shown in the brand block. */
  brandInitials?: string;
  positionsBadge?: number;
  positionsOpen?: boolean;
  onPositionsToggle?: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

/**
 * Vertical icon-only rail (Vela style). Each row is a self-contained
 * button/link so future tooltips / context menus only re-render their own
 * subtree.
 *
 * Positions is the one item that doesn't navigate — instead it toggles the
 * PositionsDrawer. The parent owns that open/close flag via
 * `positionsOpen` + `onPositionsToggle`.
 */
export function IconSidebar({
  brandInitials = "DT",
  positionsBadge,
  positionsOpen = false,
  onPositionsToggle,
  theme = "light",
  onThemeToggle,
}: IconSidebarProps) {
  const pathname = usePathname();
  const [activeKey, setActiveKey] = useState<string>("home");

  const primary: NavItem[] = [
    { key: "apps", label: "Apps", icon: <AppsGridIcon className="h-[18px] w-[18px]" />, href: "/home" },
    { key: "home", label: "Home", icon: <HomeIcon className="h-[18px] w-[18px]" />, href: "/options" },
    {
      key: "positions",
      label: "Positions",
      icon: <ClockIcon className="h-[18px] w-[18px]" />,
      badge: positionsBadge,
      onClick: onPositionsToggle,
      controlledActive: positionsOpen,
    },
    { key: "reports", label: "Reports", icon: <DocIcon className="h-[18px] w-[18px]" /> },
  ];

  const secondary: NavItem[] = [
    { key: "help", label: "Help", icon: <HelpIcon className="h-[18px] w-[18px]" /> },
    { key: "language", label: "Language", icon: <GlobeIcon className="h-[18px] w-[18px]" /> },
  ];

  const isActive = (item: NavItem) => {
    if (item.controlledActive !== undefined) return item.controlledActive;
    if (item.href) return pathname?.startsWith(item.href) ?? false;
    return activeKey === item.key;
  };

  return (
    <div className="flex h-full flex-col py-3.5">
      {/* Brand block */}
      <div className="flex justify-center px-3 pb-4">
        <div
          className={cn(
            "grid h-7 w-7 place-items-center rounded-lg",
            "bg-opt-ink text-opt-bg",
            "font-semibold text-sm",
          )}
        >
          {brandInitials.slice(0, 2)}
        </div>
      </div>

      <NavRail items={primary} isActive={isActive} onSelect={setActiveKey} />

      <div className="flex-1" />

      <NavRail items={secondary} isActive={isActive} onSelect={setActiveKey} />

      <NavButton
        label={theme === "dark" ? "Light mode" : "Dark mode"}
        icon={
          theme === "dark" ? (
            <SunIcon className="h-[18px] w-[18px]" />
          ) : (
            <MoonIcon className="h-[18px] w-[18px]" />
          )
        }
        active={false}
        onClick={onThemeToggle}
      />

      <NavButton
        label="Account"
        icon={<UserIcon className="h-[18px] w-[18px]" />}
        active={false}
        onClick={() => undefined}
      />
    </div>
  );
}

function NavRail({
  items,
  isActive,
  onSelect,
}: {
  items: NavItem[];
  isActive: (i: NavItem) => boolean;
  onSelect: (k: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
        const active = isActive(item);
        const hasCustomClick = !!item.onClick;
        // A custom onClick beats the href — useful for "Positions" which is a
        // drawer toggle, not a route.
        if (item.href && !hasCustomClick) {
          return (
            <NavLinkBtn
              key={item.key}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
              badge={item.badge}
            />
          );
        }
        return (
          <NavButton
            key={item.key}
            label={item.label}
            icon={item.icon}
            active={active}
            badge={item.badge}
            onClick={() => {
              item.onClick?.();
              onSelect(item.key);
            }}
          />
        );
      })}
    </div>
  );
}

function NavLinkBtn({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number | string;
}) {
  return (
    <Link
      href={href as Route}
      title={label}
      aria-label={label}
      className={cn(navItemClass, active && navItemActive)}
    >
      <span className="relative grid place-items-center">
        {icon}
        {badge && <Badge value={badge} />}
      </span>
    </Link>
  );
}

function NavButton({
  label,
  icon,
  active,
  badge,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number | string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(navItemClass, active && navItemActive)}
    >
      <span className="relative grid place-items-center">
        {icon}
        {badge && <Badge value={badge} />}
      </span>
    </button>
  );
}

function Badge({ value }: { value: number | string }) {
  return (
    <span
      className={cn(
        "absolute -right-1.5 -top-1.5 grid h-[14px] min-w-[14px] place-items-center rounded-full px-1",
        "bg-opt-fall text-white text-[9px] font-semibold leading-none",
      )}
    >
      {value}
    </span>
  );
}

const navItemClass = cn(
  "grid h-10 w-10 mx-auto place-items-center rounded-lg",
  "text-opt-ink-3",
  "transition-colors duration-150",
  "hover:bg-opt-bg-sunk hover:text-opt-ink",
);
const navItemActive = "bg-opt-bg-sunk text-opt-ink";
