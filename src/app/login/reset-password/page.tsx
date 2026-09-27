import type { Metadata } from "next";
import { ResetPasswordPageClient } from "@/components/ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}
