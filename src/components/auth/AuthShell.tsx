import { cn } from "@/lib/cn";

/** FXNOD brand lockup (gold diamond + wordmark), matching the top nav. */
function BrandMark() {
  return (
    <div className="flex items-center gap-2 text-[22px] font-extrabold tracking-[0.18em] text-gold">
      <span
        className="h-[8px] w-[8px] rotate-45 rounded-sm bg-gold"
        style={{ boxShadow: "0 0 14px rgba(201,162,78,0.6)" }}
      />
      FXNOD
    </div>
  );
}

/**
 * Centered card shell shared by the login + register screens. Uses the global
 * (non-options) theme tokens so it renders correctly outside the /options app.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <BrandMark />
          <div className="flex flex-col gap-1">
            <h1 className="text-[20px] font-bold text-ink">{title}</h1>
            {subtitle && <p className="text-[13px] text-ink-3">{subtitle}</p>}
          </div>
        </div>

        <div
          className={cn(
            "rounded-2xl border border-line bg-surface p-6",
            "shadow-[0_12px_40px_rgba(10,21,53,0.08)]",
          )}
        >
          {children}
        </div>

        {footer && (
          <div className="mt-5 text-center text-[13px] text-ink-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
