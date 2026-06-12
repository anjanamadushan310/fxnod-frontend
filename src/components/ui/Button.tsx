import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "gold" | "ghost" | "navy";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/**
 * Two house variants:
 *   - `gold`: pill, FXNod gold gradient. Use for primary CTAs (Deposit, Continue).
 *   - `ghost`: rounded rectangle, surface bg. Use for row actions (Trade, Details).
 *   - `navy`: navy gradient pill. Reserved for dark-on-light contexts.
 */
const variantClasses: Record<Variant, string> = {
  gold:
    "rounded-full px-[26px] py-[11px] text-[13px] font-bold tracking-[0.04em] " +
    "text-[#1a1208] border-0 " +
    "bg-[linear-gradient(180deg,var(--gold-2),var(--gold))] " +
    "shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_14px_-6px_rgba(201,162,78,0.6)] " +
    "transition-transform duration-[120ms] " +
    "hover:-translate-y-[1px] hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_18px_-6px_rgba(201,162,78,0.8)] " +
    "active:translate-y-0",
  ghost:
    "rounded-lg px-4 py-2 text-xs font-semibold " +
    "bg-surface border border-line text-ink " +
    "transition-colors duration-150 " +
    "hover:border-gold hover:text-gold-3 hover:bg-gold-soft " +
    "dark:hover:text-gold-2",
  navy:
    "rounded-full px-[26px] py-[11px] text-[13px] font-bold tracking-[0.04em] " +
    "text-gold border border-gold/30 " +
    "bg-[linear-gradient(180deg,var(--navy-3),var(--navy))] " +
    "transition-colors duration-150 " +
    "hover:border-gold",
};

export function Button({
  variant = "ghost",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={cn(variantClasses[variant], className)} {...rest}>
      {children}
    </button>
  );
}
