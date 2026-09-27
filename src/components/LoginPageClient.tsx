"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { normalizeStudioReturnPath } from "@/lib/studio-auth-gate";

type Mode = "signin" | "signup";

type LoginPageClientProps = {
  initialMode?: Mode;
  redirectTo?: string;
};

export function LoginPageClient({
  initialMode = "signin",
  redirectTo,
}: LoginPageClientProps) {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const afterSignInPath = normalizeStudioReturnPath(redirectTo);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        setMessage(
          "Check your email for a verification link. After verifying, sign in here.",
        );
        setMode("signin");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(afterSignInPath);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <div className="studio-card mx-auto max-w-md p-8">
        <h1 className="text-xl font-semibold text-studio-fg">Cloud library</h1>
        <p className="mt-3 text-sm leading-relaxed text-studio-muted">
          Supabase is not configured in this environment. The demo studio still
          works with a browser-only library.
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
        <h1 className="text-2xl font-semibold text-studio-fg">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-studio-muted">
          Sign in to generate images and videos and save them to your private
          cloud library. The public showcase is available without an account.
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
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center justify-between text-studio-muted">
            Password
            {mode === "signin" ? (
              <Link
                href="/login/forgot-password"
                className="text-studio-accent-bright hover:underline"
              >
                Forgot password?
              </Link>
            ) : null}
          </span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="studio-input"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600" role="alert">{error}</p>
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
          {pending
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-studio-muted">
        {mode === "signin" ? (
          <>
            New here?{" "}
            <button
              type="button"
              className="text-studio-accent-bright hover:underline"
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
              }}
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="text-studio-accent-bright hover:underline"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <Link
        href="/library"
        className="text-center text-sm text-studio-muted hover:underline"
      >
        Browse the public library without signing in
      </Link>
    </div>
  );
}
