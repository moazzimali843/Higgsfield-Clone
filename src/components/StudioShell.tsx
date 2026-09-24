"use client";

import Link from "next/link";
import { HiggsfieldApiKeyPanel } from "@/components/HiggsfieldApiKeyPanel";
import { HiggsfieldApiKeyProvider } from "@/components/HiggsfieldApiKeyProvider";
import { MoreNavMenu } from "@/components/MoreNavMenu";
import { useHydratedPathname } from "@/hooks/use-hydrated-pathname";
import { liveNav } from "@/lib/navigation";

function navLinkClass(isActive: boolean) {
  return [
    "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
    isActive
      ? "bg-studio-accent/20 text-studio-accent-bright shadow-[0_0_20px_-8px_var(--studio-glow)] ring-1 ring-studio-accent/30"
      : "text-studio-muted hover:text-studio-fg hover:bg-white/5",
  ].join(" ");
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = useHydratedPathname();

  return (
    <HiggsfieldApiKeyProvider>
      <div className="flex min-h-full flex-col">
        <header className="studio-header-enter sticky top-0 z-50 border-b border-studio-border-subtle bg-[#0c0c12] shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/" className="group flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 text-sm font-bold text-studio-accent-bright ring-1 ring-white/10 shadow-[0_0_24px_-8px_var(--studio-glow)]"
                  aria-hidden
                >
                  H
                </span>
                <span className="studio-display text-lg font-semibold tracking-tight text-studio-fg transition-colors group-hover:text-studio-accent-bright">
                  Studio
                </span>
              </Link>
              <HiggsfieldApiKeyPanel />
            </div>

            <nav
              className="studio-nav-capsule flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 sm:px-3"
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

        <main className="relative z-0 mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          {children}
        </main>

        <footer className="border-t border-studio-border-subtle px-4 py-8 text-center text-xs leading-relaxed text-studio-muted sm:px-6">
          <p className="mx-auto max-w-2xl">
            Educational preview inspired by{" "}
            <a
              href="https://higgsfield.ai/"
              className="text-studio-accent-bright hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Higgsfield
            </a>
            . Showcase media may include stock from{" "}
            <a
              href="https://www.pexels.com/license/"
              className="text-studio-accent-bright hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pexels
            </a>
            ; labeled Demo and API outputs in your library are generated through
            this app&apos;s demo or Higgsfield job routes.
          </p>
        </footer>
      </div>
    </HiggsfieldApiKeyProvider>
  );
}
