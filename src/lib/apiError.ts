import axios from "axios";

export interface ParsedApiError {
  /** User-facing summary for a toast. */
  message: string;
  /** Per-field messages keyed by field name (from FastAPI 422 validation). */
  fieldErrors: Record<string, string>;
}

/**
 * Normalize a backend error from the shared Axios instance into a toast message
 * plus per-field errors. Handles the two FastAPI shapes:
 *   - `{ detail: "Email is already registered" }`            (string)
 *   - `{ detail: [{ loc: ["body","email"], msg, type }] }`   (422 validation)
 */
export function parseApiError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): ParsedApiError {
  const fieldErrors: Record<string, string> = {};

  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)
      ?.detail;

    if (typeof detail === "string") {
      return { message: detail, fieldErrors };
    }

    if (Array.isArray(detail)) {
      for (const item of detail as Array<{ loc?: unknown[]; msg?: unknown }>) {
        const loc = Array.isArray(item?.loc) ? item.loc : [];
        // loc is like ["body", "email"] — the last segment is the field.
        const field = String(loc[loc.length - 1] ?? "");
        const msg = String(item?.msg ?? "Invalid value");
        if (field && field !== "body" && !fieldErrors[field]) {
          fieldErrors[field] = capitalize(msg);
        }
      }
      const first = Object.values(fieldErrors)[0];
      return {
        message: first ?? "Please correct the highlighted fields.",
        fieldErrors,
      };
    }

    if (error.code === "ERR_NETWORK") {
      return {
        message: "Network error — please check your connection and try again.",
        fieldErrors,
      };
    }
  }

  return { message: fallback, fieldErrors };
}

function capitalize(s: string): string {
  return s.length ? s[0]!.toUpperCase() + s.slice(1) : s;
}
