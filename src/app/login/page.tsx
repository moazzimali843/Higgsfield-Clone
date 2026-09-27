import type { Metadata } from "next";
import { LoginPageClient } from "@/components/LoginPageClient";
import { firstQueryValue } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ mode?: string | string[]; redirect?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const modeParam = firstQueryValue(params.mode);
  const initialMode = modeParam === "signup" ? "signup" : "signin";
  const redirectTo = firstQueryValue(params.redirect);

  return (
    <LoginPageClient initialMode={initialMode} redirectTo={redirectTo} />
  );
}
