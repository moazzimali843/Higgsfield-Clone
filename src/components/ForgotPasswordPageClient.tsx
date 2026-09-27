"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function resetPasswordRedirectUrl(): string {
  const next = encodeURIComponent("/login/reset-password");
  return `${window.location.origin}/auth/callback?next=${next}`;
}

export function ForgotPasswordPageClient() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured on this deployment.");
      return;
    }

    setPending(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: resetPasswordRedirectUrl() },
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setMessage(
        "If an account exists for that email, we sent a link to reset your password. Check your inbox and spam folder.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <div className="studio-card mx-auto max-w-md p-8">
        <h1 className="text-xl font-semibold text-studio-fg">Reset password</h1>
        <p className="mt-3 text-sm leading-relaxed text-studio-muted">
          Supabase is not configured in this environment.
        </p>
        <Link href="/" className="studio-btn-primary mt-6 inline-flex">
          Back to studio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-studio-fg">Forgot password</h1>
        <p className="mt-2 text-sm text-studio-muted">
          Enter your account email and we&apos;ll send a link to choose a new
          password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="studio-card flex flex-col gap-4 p-6">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-studio-muted">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="studio-input"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-studio-accent-bright" role="status">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="studio-btn-primary"
        >
          {pending ? "Please wait…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-studio-muted">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-studio-accent-bright hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
