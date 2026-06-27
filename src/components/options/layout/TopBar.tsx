"use client";

import { ConnectDerivButton } from "../deriv/ConnectDerivButton";
import { AccountSelector, type OptionsAccountMode } from "./AccountSelector";
import { ContractTypeTabs } from "./ContractTypeTabs";
import { DepositButton } from "./DepositButton";
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
 * The top bar is a pure composition — it owns no live data of its own, just
 * forwards props. Each child component re-renders independently when its
 * own slice changes (e.g. balance ticks → only AccountSelector repaints).
 */
export function TopBar({
  contractType,
  onContractTypeChange,
  accountMode,
  accountBalance,
  onAccountOpen,
  onDeposit,
}: TopBarProps) {
  return (
    <div className="flex h-full items-center gap-2 px-4">
      <ContractTypeTabs value={contractType} onChange={onContractTypeChange} />

      <ConnectDerivButton />

      <AccountSelector
        mode={accountMode}
        balance={accountBalance}
        onOpen={onAccountOpen}
      />

      <DepositButton onClick={onDeposit} />
    </div>
  );
}
