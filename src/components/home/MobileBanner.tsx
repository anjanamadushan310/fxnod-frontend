import { FauxQR } from "./FauxQR";
import { cn } from "@/lib/cn";

export function MobileBanner() {
  return (
    <section
      className={cn(
        "grid items-center gap-6 rounded-2xl border border-gold/25 px-7 py-6 text-[#f4eedb]",
        "grid-cols-[1fr_auto_auto_auto]",
        "bg-[radial-gradient(120%_200%_at_0%_0%,rgba(201,162,78,0.25),transparent_45%),linear-gradient(135deg,var(--navy),var(--navy-3))]",
        "shadow-[0_10px_30px_-14px_rgba(10,20,48,0.4)]",
        "max-lg:grid-cols-2 max-lg:gap-[18px] max-lg:p-[18px]",
      )}
    >
      <div>
        <div className="text-[22px] font-extrabold leading-[1.15] tracking-[0.06em] text-gold max-lg:col-[1/-1] max-lg:text-lg">
          FXNOD
          <small className="mt-1 block text-sm font-bold tracking-[0.16em] text-[#f4eedb]">
            MOBILE APP
          </small>
        </div>
      </div>

      <div
        className={cn(
          "grid h-[62px] w-[62px] place-items-center rounded-xl border border-gold/40",
          "bg-[linear-gradient(135deg,#1a2752,#0b1532)]",
          "max-lg:hidden",
        )}
      >
        <svg viewBox="0 0 60 60" width="38" height="38" fill="none">
          <path
            d="M30 6 L52 14 V32 C52 44 42 52 30 56 C18 52 8 44 8 32 V14 Z"
            stroke="#c9a24e"
            strokeWidth="2"
          />
          <path
            d="M18 36 L26 30 L34 34 L46 22"
            stroke="#c9a24e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M40 22 L46 22 L46 28"
            stroke="#c9a24e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <QRTile seed={3} label="App Store" />
      <QRTile seed={11} label="Google Play" />
    </section>
  );
}

function QRTile({ seed, label }: { seed: number; label: string }) {
  return (
    <div className="relative grid h-[88px] w-[88px] place-items-center rounded-[10px] bg-white p-1.5">
      <FauxQR seed={seed} />
      <div className="absolute -bottom-[22px] left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-[#f4eedb]/70">
        {label}
      </div>
    </div>
  );
}
