"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHydratedPathname } from "@/hooks/use-hydrated-pathname";
import { comingSoonNav } from "@/lib/navigation";

const MENU_PANEL_ID = "studio-more-menu-panel";

export function MoreNavMenu() {
  const pathname = useHydratedPathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isComingSoonActive =
    pathname !== null &&
    comingSoonNav.some((item) => item.href === pathname);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={[
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
          isComingSoonActive || open
            ? "bg-studio-accent/15 text-studio-accent"
            : "text-studio-muted hover:bg-zinc-100 hover:text-studio-fg",
        ].join(" ")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? MENU_PANEL_ID : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        More
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden
          className={open ? "rotate-180 transition-transform" : "transition-transform"}
        >
          <path fill="currentColor" d="M2.5 4.5 6 8l3.5-3.5H2.5z" />
        </svg>
      </button>

      {open ? (
        <div
          id={MENU_PANEL_ID}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-xl border border-studio-border bg-studio-panel p-2 shadow-xl shadow-black/40"
        >
          <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-studio-muted">
            Coming soon
          </p>
          <ul className="max-h-[min(70vh,24rem)] overflow-y-auto">
            {comingSoonNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} role="none">
                  <Link
                    href={item.href}
                    role="menuitem"
                    className={[
                      "flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-studio-accent/15 text-studio-accent"
                        : "text-studio-fg hover:bg-zinc-100",
                    ].join(" ")}
                    onClick={close}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] uppercase tracking-wide text-studio-muted">
                      Soon
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
