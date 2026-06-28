"use client";

import { useRef, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { AppsGridIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { AuthModal } from "../auth/AuthModal";
import { ConnectDerivButton } from "../deriv/ConnectDerivButton";
import { AnchoredPopover } from "../order/fields/AnchoredPopover";
import { AccountSelector, type OptionsAccountMode } from "./AccountSelector";
import { ContractTypeTabs } from "./ContractTypeTabs";
import { DepositButton } from "./DepositButton";
import { TradeTypesFlyout } from "./TradeTypesFlyout";
import type { ContractTypeId } from "./contractTypes";

interface TopBarProps {
  contractType: ContractTypeId;
  onContractTypeChange: (id: ContractTypeId) => void;
  accountMode: OptionsAccountMode;
  accountBalance: number;
  onAccountOpen?: () => void;
  onDeposit?: () => void;
}

/**
 * Top bar — a single flex row split into two clusters:
 *
 *   [ trading-method tabs (flex-1, scrolls) ] [ right cluster (shrink-0) ]
 *
 * The tabs live in their own `flex-1 min-w-0 overflow-x-auto` track so a long
 * list scrolls *inside* itself instead of pushing the account / deposit
 * controls off-screen (the overlap bug). The right cluster is `ml-auto
 * shrink-0` so it stays pinned far-right regardless of tab count.
 *
 * Right cluster is auth-gated: logged-out users see a single "Log in / Sign
 * up" CTA (opens the Deriv-connect modal); authenticated users get the Deriv
 * link chip, account selector and deposit button.
 */
export function TopBar({
  contractType,
  onContractTypeChange,
  accountMode,
  accountBalance,
  onAccountOpen,
  onDeposit,
}: TopBarProps) {
  const status = useAuthStore((s) => s.status);
  const authed = status === "authenticated";
  const [authOpen, setAuthOpen] = useState(false);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const gridRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex h-full items-center gap-2 px-4">
      {/* Trade-types flyout trigger (§2 grid icon → §11 flyout) */}
      <button
        ref={gridRef}
        type="button"
        aria-label="Trade types"
        aria-haspopup="dialog"
        aria-expanded={flyoutOpen}
        onClick={() => setFlyoutOpen((v) => !v)}
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors",
          flyoutOpen
            ? "bg-opt-bg-sunk text-opt-ink"
            : "text-opt-ink-3 hover:bg-opt-bg-sunk hover:text-opt-ink",
        )}
      >
        <AppsGridIcon className="h-[18px] w-[18px]" />
      </button>
      {flyoutOpen && (
        <AnchoredPopover anchorRef={gridRef} onClose={() => setFlyoutOpen(false)}>
          <TradeTypesFlyout
            activeType={contractType}
            onSelect={(id) => {
              onContractTypeChange(id);
              setFlyoutOpen(false);
            }}
          />
        </AnchoredPopover>
      )}

      {/* Trading methods — scroll independently, never push the right cluster */}
      <div className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ContractTypeTabs value={contractType} onChange={onContractTypeChange} />
      </div>

      {/* Right cluster — pinned far right */}
      <div className="ml-auto flex shrink-0 items-center gap-4">
        {authed ? (
          <>
            <ConnectDerivButton />
            <AccountSelector
              mode={accountMode}
              balance={accountBalance}
              onOpen={onAccountOpen}
            />
            <DepositButton onClick={onDeposit} />
          </>
        ) : (
          <LoginButton onClick={() => setAuthOpen(true)} />
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

function LoginButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center rounded-[10px] px-4 py-1.5",
        "text-[13px] font-semibold text-white transition-[filter] duration-150",
        "bg-opt-ink hover:brightness-110",
      )}
    >
      Log in / Sign up
    </button>
  );
}
