"use client";

import { useQuery } from "@tanstack/react-query";
import {
  derivAccountStatus,
  getDerivAccountStatusQueryKey,
} from "@/services/api/endpoints/trading/trading";

export interface DerivStatus {
  /** True once the user has a linked Deriv account. */
  linked: boolean;
  /** Linked loginid, e.g. CR123456 (undefined when unlinked). */
  accountId: string | undefined;
  /** Status query still in flight (avoid flashing the "not linked" gate). */
  isLoading: boolean;
}

/** React Query key shared by the status query + its invalidations. */
export const derivStatusKey = getDerivAccountStatusQueryKey();

/**
 * Single source of truth for "is a Deriv account linked?".
 *
 * Wraps the Orval-generated `derivAccountStatus` GET (→ shared axios, so it
 * honours NEXT_PUBLIC_API_URL + auth). Consumed by both the TopBar connect
 * control and the order panels' trade gate, so the cache is shared — linking
 * in the callback invalidates this one key and both update.
 */
export function useDerivStatus(): DerivStatus {
  const query = useQuery({
    queryKey: derivStatusKey,
    queryFn: () => derivAccountStatus(),
    staleTime: 60_000,
    // 401 (logged out) / unlinked both just mean "show Connect / gate trading".
    retry: false,
  });

  return {
    linked: query.data?.linked ?? false,
    accountId: query.data?.deriv_account_id,
    isLoading: query.isLoading,
  };
}
