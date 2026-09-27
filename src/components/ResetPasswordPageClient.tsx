"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function ResetPasswordPageClient() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!configured) {
      setSessionReady(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setSessionReady(false);
      return;
    }

    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSessionReady(Boolean(data.session));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [configured]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured on this deployment.");
      return;
    }

    setPending(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.push("/library");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <div className="studio-card mx-auto max-w-md p-8">
        <h1 className="text-xl font-semibold text-studio-fg">New password</h1>
        <p className="mt-3 text-sm leading-relaxed text-studio-muted">
          Supabase is not configured in this environment.
        </p>
        <Link href="/" className="studio-btn-primary mt-6 inline-flex">
          Back to studio
        </Link>
      </div>
    );
  }

  if (sessionReady === null) {
    return (
      <div className="studio-card p-6 text-center text-sm text-studio-muted">
        Loading…
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-studio-fg">New password</h1>
          <p className="mt-2 text-sm text-studio-muted">
            Open the reset link from your email to set a new password here. Links
            expire after a while.
          </p>
        </div>
        <div className="studio-card flex flex-col gap-4 p-6">
          <Link href="/login/forgot-password" className="studio-btn-primary text-center">
            Request a new link
          </Link>
          <Link
            href="/login"
            className="text-center text-sm text-studio-muted hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-studio-fg">Choose a new password</h1>
        <p className="mt-2 text-sm text-studio-muted">
          Enter a new password for your account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="studio-card flex flex-col gap-4 p-6">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-studio-muted">New password</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="studio-input"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-studio-muted">Confirm password</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="studio-input"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="studio-btn-primary"
        >
          {pending ? "Please wait…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
