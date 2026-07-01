"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { useResendOtp, useVerifyOtp } from "@/services/api/endpoints/auth/auth";
import { setAccessToken } from "@/services/authToken";
import { useAuthStore } from "@/stores/authStore";
import { parseApiError } from "@/lib/apiError";
import { AuthShell } from "./AuthShell";
import { Field, SubmitButton } from "./fields";

// Mirrors the backend OTP_RESEND_COOLDOWN_SECONDS default.
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * OTP verification screen. Reached after registration with `?email=`. Verifying
 * the code both confirms the account AND logs the user in (the backend returns
 * a token pair + sets the httpOnly refresh cookie), so on success we establish
 * the session and route to the dashboard — no separate login step.
 */
export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bootstrap = useAuthStore((s) => s.bootstrap);

  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Start on cooldown: a code was just emailed at registration.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const verifyMut = useVerifyOtp({
    mutation: {
      onSuccess: async (data) => {
        setAccessToken(data.access_token);
        await bootstrap(); // GET /users/me → store user + status: authenticated
        toast.success("Account verified — welcome to FXNod!");
        router.push("/" as Route);
      },
      onError: (err) => {
        const parsed = parseApiError(err, "Invalid or expired code.");
        setFieldErrors(parsed.fieldErrors.code ? parsed.fieldErrors : {});
        toast.error(parsed.message);
      },
    },
  });

  const resendMut = useResendOtp({
    mutation: {
      onSuccess: () => {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        toast.success("A new code is on its way if the account exists.");
      },
      onError: (err) => {
        // On 429 the backend sends Retry-After; respect it, else fall back.
        let retryAfter = RESEND_COOLDOWN_SECONDS;
        if (axios.isAxiosError(err) && err.response?.status === 429) {
          const header = err.response.headers?.["retry-after"];
          const parsed = Number(header);
          if (Number.isFinite(parsed) && parsed > 0) retryAfter = parsed;
        }
        setCooldown(retryAfter);
        toast.error(parseApiError(err, "Please wait before requesting another code.").message);
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    if (!email) {
      toast.error("Missing email — please register again.");
      return;
    }
    verifyMut.mutate({ data: { email, code } });
  }

  function onResend() {
    if (cooldown > 0 || !email) return;
    resendMut.mutate({ data: { email } });
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        email
          ? `Enter the 6-digit code we sent to ${email}, or use the link in that email.`
          : "Enter the 6-digit code we emailed you, or use the link in that email."
      }
      footer={
        <>
          Wrong email?{" "}
          <a href="/auth/register" className="font-semibold text-gold hover:underline">
            Register again
          </a>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label="Verification code"
          value={code}
          onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
          error={fieldErrors.code}
          autoComplete="one-time-code"
          placeholder="123456"
          required
        />
        <SubmitButton pending={verifyMut.isPending}>Verify &amp; continue</SubmitButton>
      </form>

      <button
        type="button"
        onClick={onResend}
        disabled={cooldown > 0 || resendMut.isPending}
        className="mt-4 text-[13px] font-semibold text-gold hover:underline disabled:cursor-not-allowed disabled:text-ink-3 disabled:no-underline"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </AuthShell>
  );
}
