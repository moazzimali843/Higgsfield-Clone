"use client";

import Link from "next/link";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";

type StudioAuthPanelProps = {
  collapsed?: boolean;
  variant?: "sidebar" | "header";
};

export function StudioAuthPanel({
  collapsed = false,
  variant = "sidebar",
}: StudioAuthPanelProps) {
  const { configured, loading, user, signOut } = useSupabaseAuth();

  if (!configured) {
    return null;
  }

  if (loading) {
    if (variant === "header") {
      return (
        <div
          className="h-9 w-28 rounded-lg bg-studio-bg-elevated/80"
          aria-hidden
        />
      );
    }
    return (
      <p
        className={[
          "text-xs text-studio-muted",
          collapsed ? "text-center" : "px-1",
        ].join(" ")}
      >
        …
      </p>
    );
  }

  if (!user) {
    if (variant === "header") {
      return (
        <nav
          className="flex items-center gap-2"
          aria-label="Account"
        >
          <Link href="/login" className="studio-btn-secondary px-4 py-2 text-sm">
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="studio-btn-primary px-4 py-2 text-sm"
          >
            Sign up
          </Link>
        </nav>
      );
    }

    return (
      <Link
        href="/login"
        title={collapsed ? "Sign in" : undefined}
        className={[
          "studio-btn-nav text-studio-accent-bright",
          collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
        ].join(" ")}
      >
        {collapsed ? "↗" : "Sign in for cloud library"}
      </Link>
    );
  }

  const label = user.email?.split("@")[0] ?? "Account";

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={() => void signOut()}
        className="studio-btn-secondary px-4 py-2 text-sm"
      >
        Logout
      </button>
    );
  }

  return (
    <div
      className={[
        "flex flex-col gap-2",
        collapsed ? "items-center" : "px-1",
      ].join(" ")}
    >
      <p
        className={[
          "truncate text-xs text-studio-muted",
          collapsed ? "max-w-full text-center" : "",
        ].join(" ")}
        title={user.email ?? undefined}
      >
        {collapsed ? label.slice(0, 1).toUpperCase() : `Signed in · ${label}`}
      </p>
      <button
        type="button"
        onClick={() => void signOut()}
        className={[
          "studio-btn-nav text-xs",
          collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
        ].join(" ")}
      >
        {collapsed ? "⎋" : "Sign out"}
      </button>
    </div>
  );
}
