"use client";

import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}

/** Labeled text input with an inline validation message. */
export function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
  autoComplete,
  placeholder,
  required,
}: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-ink-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full rounded-lg border bg-bg px-3 py-2.5 text-[14px] text-ink outline-none",
          "transition-colors placeholder:text-ink-3 focus:border-gold",
          error ? "border-red-500" : "border-line",
        )}
      />
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </label>
  );
}

/** Primary submit button with a pending spinner. */
export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "mt-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-navy",
        "text-[14px] font-bold text-gold transition-[filter] hover:brightness-125",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {pending && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-gold/40 border-t-gold"
        />
      )}
      {children}
    </button>
  );
}
