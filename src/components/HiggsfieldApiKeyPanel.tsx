"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SidebarKeyIcon } from "@/components/StudioSidebarIcons";
import { useHiggsfieldApiKey } from "@/components/HiggsfieldApiKeyProvider";

type HiggsfieldApiKeyPanelProps = {
  align?: "start" | "end";
  variant?: "default" | "sidebar";
  collapsed?: boolean;
  dropDirection?: "up" | "down";
};

export function HiggsfieldApiKeyPanel({
  align = "end",
  variant = "default",
  collapsed = false,
  dropDirection = "down",
}: HiggsfieldApiKeyPanelProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
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
  const {
    credentials,
    setCredentials,
    saveToSession,
    clearSession,
    sessionError,
    isConnected,
    hydrated,
  } = useHiggsfieldApiKey();

  const isSidebar = variant === "sidebar";
  const dropUp = dropDirection === "up" || isSidebar;

  if (!hydrated) {
    return (
      <div
        className={[
          "animate-pulse rounded-xl border border-studio-border-subtle bg-zinc-100",
          isSidebar ? "h-10 w-full" : "h-9 min-w-[7.5rem] rounded-full",
        ].join(" ")}
        aria-hidden
      />
    );
  }

  const panelPositionClass = dropUp
    ? "bottom-full left-0 right-0 mb-2 studio-dropdown-enter-up"
    : align === "start"
      ? "left-0 mt-2"
      : "right-0 mt-2";

  const panelWidthClass = isSidebar
    ? "w-full max-w-full"
    : "w-[min(100vw-2rem,22rem)]";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        title={collapsed ? "API key" : undefined}
        onClick={() => setOpen((value) => !value)}
        className={[
          "studio-btn-secondary text-xs",
          isSidebar
            ? [
                "w-full !rounded-xl py-2.5",
                collapsed ? "justify-center px-2" : "justify-center gap-2 px-3",
              ].join(" ")
            : "gap-2 px-3 py-2",
        ].join(" ")}
      >
        {isSidebar ? (
          <SidebarKeyIcon className="text-studio-fg" />
        ) : null}
        <span
          className={[
            collapsed && isSidebar
              ? "pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
              : "",
          ].join(" ")}
        >
          API key
        </span>
        {isConnected ? (
          collapsed && isSidebar ? (
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"
              aria-label="Connected"
            />
          ) : (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              Connected
            </span>
          )
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          className={[
            "absolute z-50 rounded-xl border border-studio-border-subtle bg-white p-3 shadow-lg shadow-zinc-900/10",
            dropUp ? "studio-dropdown-enter-up" : "studio-dropdown-enter",
            panelPositionClass,
            panelWidthClass,
            isSidebar ? "max-h-[min(70vh,28rem)] overflow-y-auto" : "p-4",
          ].join(" ")}
        >
          <h2 className="text-sm font-medium text-studio-fg">Higgsfield API Key</h2>

          <div className="mt-3">
            <input
              id={`${panelId}-creds`}
              type="password"
              autoComplete="off"
              aria-label="Higgsfield API Key"
              placeholder="Enter API Key..."
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              className="studio-input"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (saveToSession()) setOpen(false);
              }}
              className="studio-btn-primary studio-btn-sm"
            >
              Save for session
            </button>
            <button
              type="button"
              onClick={clearSession}
              className="studio-btn-secondary studio-btn-sm"
            >
              Clear
            </button>
          </div>
          {sessionError ? (
            <p className="studio-alert-warning-xs mt-2" role="alert">
              {sessionError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
