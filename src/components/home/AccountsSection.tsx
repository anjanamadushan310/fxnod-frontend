"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/ui/Icons";
import { AccountRow } from "./AccountRow";
import { ModeToggle, type AccountMode } from "./ModeToggle";
import { cn } from "@/lib/cn";

interface Account {
  name: string;
  realBalance: number;
  demoBalance: number;
}

interface AccountsSectionProps {
  accounts?: Account[];
  ticking?: boolean;
  onDeposit?: () => void;
  onTrade?: () => void;
  onDetails?: () => void;
  onAddAccount?: () => void;
}

const DEFAULT_ACCOUNTS: Account[] = [
  { name: "FXNOD CFDs Account #882104", realBalance: 2500.5, demoBalance: 10000.0 },
  { name: "FXNOD CFDs Account #882217", realBalance: 1300.0, demoBalance: 5000.0 },
];

export function AccountsSection({
  accounts = DEFAULT_ACCOUNTS,
  ticking = true,
  onDeposit,
  onTrade,
  onDetails,
  onAddAccount,
}: AccountsSectionProps) {
  const [mode, setMode] = useState<AccountMode>("real");

  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="m-0 text-lg font-bold tracking-[-0.01em] text-ink">
          My trading accounts
        </h2>
        <ModeToggle value={mode} onChange={setMode} />
      </div>

      <div className="flex flex-col gap-2.5">
        {accounts.map((account) => (
          <AccountRow
            key={account.name}
            name={account.name}
            seed={mode === "real" ? account.realBalance : account.demoBalance}
            ticking={ticking}
            onDeposit={onDeposit}
            onTrade={onTrade}
            onDetails={onDetails}
          />
        ))}

        <button
          type="button"
          onClick={onAddAccount}
          className={cn(
            "flex w-full items-center justify-center gap-2.5 rounded-2xl bg-transparent p-3.5 text-[13px] font-semibold text-ink-2",
            "border border-dashed border-line",
            "transition-colors hover:border-gold hover:bg-gold-soft hover:text-gold-3",
          )}
        >
          <PlusIcon className="h-4 w-4" /> Add more accounts
        </button>
      </div>
    </section>
  );
}
