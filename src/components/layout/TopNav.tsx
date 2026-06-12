"use client";

import { BellIcon, MenuIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

const NAV_ITEMS: { label: string; href: string; active?: boolean }[] = [
  { label: "DASHBOARD", href: "/home", active: true },
  { label: "MARKETS", href: "#" },
  { label: "TOOLS", href: "#" },
  { label: "ACCOUNTS", href: "#" },
  { label: "LEARN", href: "#" },
  { label: "SUPPORT", href: "#" },
];

interface TopNavProps {
  onMenu?: () => void;
}

export function TopNav({ onMenu }: TopNavProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-[72px] items-center px-10",
        "text-[#e9e3cb]",
        "bg-[linear-gradient(180deg,var(--navy)_0%,var(--navy-2)_100%)]",
        "shadow-nav border-b border-gold/20",
        "max-lg:h-[60px] max-lg:px-[18px]",
      )}
    >
      {/* Mobile menu trigger — hidden on lg+ */}
      <button
        type="button"
        onClick={onMenu}
        aria-label="Menu"
        className={cn(
          "mr-3 hidden h-9 w-9 place-items-center rounded-[10px]",
          "border border-gold/25 bg-white/[0.03] text-[#e9e3cb]",
          "transition-colors hover:border-gold/50 hover:bg-gold/[0.12]",
          "max-lg:grid",
        )}
      >
        <MenuIcon className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2.5 text-[26px] font-extrabold tracking-[0.18em] text-gold max-lg:text-[20px]">
        <span
          className="h-[9px] w-[9px] rotate-45 rounded-sm bg-gold"
          style={{ boxShadow: "0 0 16px rgba(201,162,78,0.6)" }}
        />
        FXNOD
      </div>

      <nav className="ml-auto flex gap-9 text-[13px] font-semibold tracking-[0.13em] max-lg:hidden">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "relative py-1.5 transition-colors",
              item.active
                ? "text-gold"
                : "text-[#e9e3cb]/65 hover:text-[#e9e3cb]",
            )}
          >
            {item.label}
            {item.active && (
              <span
                aria-hidden
                className="absolute -bottom-[22px] left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-t-sm bg-gold"
              />
            )}
          </a>
        ))}
      </nav>

      <div className="ml-9 flex items-center gap-[18px] max-lg:ml-auto">
        <button
          type="button"
          aria-label="Notifications"
          className={cn(
            "grid h-9 w-9 place-items-center rounded-[10px]",
            "border border-gold/25 bg-white/[0.03] text-[#e9e3cb]",
            "transition-colors hover:border-gold/50 hover:bg-gold/[0.12]",
          )}
        >
          <BellIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
