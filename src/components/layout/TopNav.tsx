"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BellIcon, CaretDownIcon, MenuIcon } from "@/components/ui/Icons";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  href?: string;
  active?: boolean;
  /** Renders an Accounts-style dropdown instead of a link. */
  dropdown?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "DASHBOARD", href: "/home", active: true },
  { label: "MARKETS", href: "#" },
  { label: "TOOLS", href: "#" },
  { label: "ACCOUNTS", dropdown: true },
  { label: "LEARN", href: "#" },
  { label: "SUPPORT", href: "#" },
];

const ACCOUNT_LINKS: { label: string; href: string }[] = [
  { label: "Login", href: "/auth/login" },
  { label: "Register", href: "/auth/register" },
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

      <nav className="ml-auto flex items-center gap-9 text-[13px] font-semibold tracking-[0.13em] max-lg:hidden">
        {NAV_ITEMS.map((item) =>
          item.dropdown ? (
            <AccountsDropdown key={item.label} label={item.label} />
          ) : (
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
          ),
        )}
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

/**
 * "Accounts" navbar item rendered as a dropdown of auth entry points.
 *
 * Opens on hover (with a small close delay so the cursor can cross the gap into
 * the menu) and toggles on click; closes on click-outside or Escape. Styled to
 * match the navy/gold navbar theme and aligned beneath the other nav links.
 */
function AccountsDropdown({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = useAuthStore((s) => s.status === "authenticated");
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    setOpen(false);
    await logout();
    toast.success("Signed out");
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Clear any pending close timer on unmount.
  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 py-1.5 tracking-[0.13em] transition-colors",
          open ? "text-[#e9e3cb]" : "text-[#e9e3cb]/65 hover:text-[#e9e3cb]",
        )}
      >
        {label}
        <CaretDownIcon
          className={cn(
            "h-3 w-3 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Accounts"
          className={cn(
            "absolute left-0 top-[calc(100%+16px)] z-50 w-44 overflow-hidden rounded-xl py-1.5",
            "border border-gold/25 bg-[var(--navy-2)]",
            "shadow-[0_18px_44px_rgba(0,0,0,0.5)]",
          )}
        >
          {isAuthenticated ? (
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className={cn(
                "block w-full px-4 py-2 text-left text-[12.5px] font-semibold tracking-[0.08em]",
                "text-[#e9e3cb]/80 transition-colors hover:bg-gold/[0.12] hover:text-gold",
              )}
            >
              Logout
            </button>
          ) : (
            ACCOUNT_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2 text-[12.5px] font-semibold tracking-[0.08em]",
                  "text-[#e9e3cb]/80 transition-colors hover:bg-gold/[0.12] hover:text-gold",
                )}
              >
                {link.label}
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
