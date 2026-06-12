"use client";

import { useCallback, useEffect, useState } from "react";

const LS_KEY = "fxnod.options.favorites";

interface FavoriteMarketsAPI {
  ids: Set<string>;
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

/**
 * LocalStorage-backed favorites set.
 *
 * Why not a global store? Favorites are per-device + cheap. Reading them
 * here keeps the picker self-contained; the Trading service learning the
 * favourite list comes later via a sync endpoint if/when accounts are
 * cross-device.
 */
export function useFavoriteMarkets(): FavoriteMarketsAPI {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  // Hydrate after mount so SSR + client markup matches.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) setIds(new Set(parsed));
    } catch {
      // Corrupted JSON — ignore and start clean.
    }
  }, []);

  const persist = (next: Set<string>) => {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify([...next]));
    } catch {
      // QuotaExceeded etc. — non-fatal, in-memory state still works.
    }
  };

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => ids.has(id),
    [ids],
  );

  return { ids, toggle, isFavorite };
}
