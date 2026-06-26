// Orval mutator — the function every generated hook calls to make a request.
// This file is NOT regenerated (orval only writes to ../endpoints and ../model).
//
// It delegates to the project's shared axios instance (`src/services/api.ts`),
// so generated hooks automatically inherit everything configured there:
//   - env-driven baseURL (NEXT_PUBLIC_API_URL)
//   - withCredentials (httpOnly refresh cookie)
//   - in-memory access-token injection (XSS-safe; from the Zustand auth store)
//   - single-flight refresh-on-401 + auth-expired notification
//
// There is intentionally NO second axios instance and NO localStorage here —
// the access token lives in memory only, per the project's security model.
import type { AxiosError, AxiosRequestConfig } from "axios";

import { api } from "@/services/api";

/**
 * Generated hooks call: customInstance({ url, method, params, data, signal, ... }).
 * React Query (v5) passes its AbortSignal through `config.signal`, which axios
 * honors natively — so request cancellation works without CancelToken.
 */
export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await api({ ...config, ...options });
  return data as T;
};

// Surfaced as the `error` type on generated hooks (e.g. ErrorType<UnauthorizedResponse>).
export type ErrorType<Error> = AxiosError<Error>;

// Used by generated mutation hooks for request bodies.
export type BodyType<BodyData> = BodyData;
