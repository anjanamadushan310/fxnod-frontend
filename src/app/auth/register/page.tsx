import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account — FXNod",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
