"use client";

import Link from "next/link";
import { MoreNavMenu } from "@/components/MoreNavMenu";
import { useHydratedPathname } from "@/hooks/use-hydrated-pathname";
import { liveNav } from "@/lib/navigation";

function navLinkClass(isActive: boolean) {
  return [
    "rounded-md px-2.5 py-1.5 text-sm transition-colors",
    isActive
      ? "bg-studio-accent/15 text-studio-accent"
      : "text-studio-muted hover:text-studio-fg hover:bg-zinc-100",
  ].join(" ");
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = useHydratedPathname();

  return (
    <div className="flex min-h-full flex-col">
      <header className="relative z-50 border-b border-studio-border bg-studio-panel/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="group flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-studio-accent/20 text-sm font-semibold text-studio-accent ring-1 ring-studio-accent/30"
                aria-hidden
              >
                H
              </span>
              <span className="font-semibold tracking-tight text-studio-fg group-hover:text-studio-accent">
                Studio
              </span>
            </Link>
            <p className="text-xs text-studio-muted sm:text-sm">
              One compose → generate → library flow
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center justify-between gap-2"
            aria-label="Main"
          >
            <ul className="flex flex-wrap items-center gap-1">
              {liveNav.map((item) => {
                const isActive =
                  pathname !== null &&
                  (item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={navLinkClass(isActive)}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <MoreNavMenu key={pathname ?? "ssr"} />
          </nav>
        </div>
      </header>

      <main className="relative z-0 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-studio-border py-6 text-center text-xs text-studio-muted">
        Inspired by{" "}
        <a
          href="https://higgsfield.ai/"
          className="text-studio-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Higgsfield
        </a>
        . Preview stills and clips from{" "}
        <a
          href="https://www.pexels.com/license/"
          className="text-studio-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pexels
        </a>{" "}
        — placeholders, not generated in this app.
      </footer>
    </div>
  );
}
