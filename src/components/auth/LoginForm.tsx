"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLogin } from "@/services/api/endpoints/auth/auth";
import { setAccessToken } from "@/services/authToken";
import { useAuthStore } from "@/stores/authStore";
import { parseApiError } from "@/lib/apiError";
import { AuthShell } from "./AuthShell";
import { Field, SubmitButton } from "./fields";

/**
 * Login screen wired to the Orval `useLogin` mutation (POST /api/v1/auth/login
 * through the shared credentialed Axios instance — the backend sets the
 * httpOnly refresh cookie). On success we stash the access token, run the auth
 * store's bootstrap() to load the user + flip status to "authenticated", then
 * redirect to the home dashboard (users pick a service from there).
 */
export function LoginForm() {
  const router = useRouter();
  const bootstrap = useAuthStore((s) => s.bootstrap);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loginMut = useLogin({
    mutation: {
      onSuccess: async (data) => {
        setAccessToken(data.access_token);
        await bootstrap(); // GET /users/me → store user + status: authenticated
        toast.success("Welcome back");
        router.push("/" as Route);
      },
      onError: (err) => {
        const parsed = parseApiError(err, "Login failed. Please try again.");
        setFieldErrors(parsed.fieldErrors);
        toast.error(parsed.message);
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    loginMut.mutate({ data: { email, password } });
  }

  return (
    <AuthShell
      title="Log in to FXNod"
      subtitle="Welcome back — sign in to continue trading."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <a href="/auth/register" className="font-semibold text-gold hover:underline">
            Register
          </a>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
        <SubmitButton pending={loginMut.isPending}>Log in</SubmitButton>
      </form>
    </AuthShell>
  );
}
