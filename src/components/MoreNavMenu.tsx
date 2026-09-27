"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SidebarMoreIcon } from "@/components/StudioSidebarIcons";
import { useHydratedPathname } from "@/hooks/use-hydrated-pathname";
import { comingSoonNav } from "@/lib/navigation";

const MENU_PANEL_ID = "studio-more-menu-panel";

/** Expanded sidebar inner width: aside `15.5rem` minus horizontal `px-3`. */
const SIDEBAR_MORE_MENU_WIDTH_CLASS = "w-[calc(15.5rem-1.5rem)]";

type MoreNavMenuProps = {
  variant?: "header" | "sidebar";
  collapsed?: boolean;
};

export function MoreNavMenu({
  variant = "header",
  collapsed = false,
}: MoreNavMenuProps) {
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

  const isSidebar = variant === "sidebar";
  const activeStyle = isComingSoonActive || open;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        title={isSidebar && collapsed ? "More" : undefined}
        className={[
          "studio-btn-nav",
          isSidebar
            ? [
                collapsed ? "justify-center px-2 py-2.5" : "justify-between gap-1.5 px-3 py-2.5",
              ].join(" ")
            : "inline-flex w-auto gap-1.5 px-3 py-2",
          activeStyle ? "studio-btn-nav--active" : "",
        ].join(" ")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? MENU_PANEL_ID : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {isSidebar ? (
          collapsed ? (
            <>
              <SidebarMoreIcon />
              <span className="pointer-events-none w-0 overflow-hidden opacity-0">
                More
              </span>
            </>
          ) : (
            <span className="inline-flex min-w-0 flex-1 items-center gap-3">
              <SidebarMoreIcon />
              <span className="truncate">More</span>
            </span>
          )
        ) : (
          <span>More</span>
        )}
        {!isSidebar || !collapsed ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            aria-hidden
            className={
              open ? "rotate-180 transition-transform" : "transition-transform"
            }
          >
            <path fill="currentColor" d="M2.5 4.5 6 8l3.5-3.5H2.5z" />
          </svg>
        ) : null}
      </button>

      {open ? (
        <div
          id={MENU_PANEL_ID}
          role="menu"
          className={[
            "absolute z-50 overflow-hidden rounded-xl border border-studio-border-subtle bg-white p-2 shadow-lg shadow-zinc-900/10",
            isSidebar
              ? [
                  "studio-dropdown-enter top-full left-0 mt-2 max-h-[min(60vh,20rem)]",
                  collapsed ? SIDEBAR_MORE_MENU_WIDTH_CLASS : "w-full",
                ].join(" ")
              : "studio-dropdown-enter right-0 mt-2 w-[min(100vw-2rem,20rem)]",
          ].join(" ")}
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
                      "studio-btn-menu-item items-center justify-between gap-2 px-2 py-2 text-sm text-studio-fg hover:bg-zinc-50",
                      isActive ? "studio-btn-menu-item--selected" : "",
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
