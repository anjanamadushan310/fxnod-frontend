import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyOtpForm } from "@/components/auth/VerifyOtpForm";

export const metadata: Metadata = {
  title: "Verify your email — FXNod",
};

export default function VerifyOtpPage() {
  // VerifyOtpForm reads `?email=` via useSearchParams, which requires a
  // Suspense boundary during static rendering in the App Router.
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
