"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useRegister } from "@/services/api/endpoints/auth/auth";
import { parseApiError } from "@/lib/apiError";
import { AuthShell } from "./AuthShell";
import { Field, SubmitButton } from "./fields";

/**
 * Registration screen wired to the Orval `useRegister` mutation (POST
 * /api/v1/auth/register). On the 201 response we send the user to the login
 * page with a success toast (register returns a user, not a session — so the
 * user logs in explicitly).
 */
export function RegisterForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const registerMut = useRegister({
    mutation: {
      onSuccess: () => {
        toast.success("Account created — please log in to continue.");
        router.push("/auth/login" as Route);
      },
      onError: (err) => {
        const parsed = parseApiError(err, "Registration failed. Please try again.");
        setFieldErrors(parsed.fieldErrors);
        toast.error(parsed.message);
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    registerMut.mutate({
      data: {
        email,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      },
    });
  }

  return (
    <AuthShell
      title="Create your FXNod account"
      subtitle="Join FXNod to fund your wallet and start trading."
      footer={
        <>
          Already have an account?{" "}
          <a href="/auth/login" className="font-semibold text-gold hover:underline">
            Log in
          </a>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name"
            value={firstName}
            onChange={setFirstName}
            error={fieldErrors.first_name}
            autoComplete="given-name"
          />
          <Field
            label="Last name"
            value={lastName}
            onChange={setLastName}
            error={fieldErrors.last_name}
            autoComplete="family-name"
          />
        </div>
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
        <SubmitButton pending={registerMut.isPending}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
