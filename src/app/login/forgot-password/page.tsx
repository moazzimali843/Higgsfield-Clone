import type { Metadata } from "next";
import { ForgotPasswordPageClient } from "@/components/ForgotPasswordPageClient";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
