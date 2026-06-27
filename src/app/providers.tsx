"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import { useAuthStore } from "@/stores/authStore";

/**
 * App-wide client providers.
 *
 * - One QueryClient per browser session, created in state so it survives
 *   re-renders but is never shared across requests (important for the App
 *   Router / RSC boundary).
 * - On mount, `bootstrap()` restores the session: there is no access token in
 *   memory after a reload, so /users/me 401s, the axios interceptor refreshes
 *   via the httpOnly cookie, and the retry succeeds if the cookie is valid.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30s — avoid refetch storms on navigation
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* App-wide toast portal (trade results, Deriv linking, …). */}
      <Toaster richColors position="top-center" closeButton />
      {/* Dev-only: the devtools entry self-excludes from production bundles,
          and this NODE_ENV guard is statically eliminated by Next at build. */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
