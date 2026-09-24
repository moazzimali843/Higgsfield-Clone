"use client";

import { useId, useState } from "react";
import { useHiggsfieldApiKey } from "@/components/HiggsfieldApiKeyProvider";

export function HiggsfieldApiKeyPanel() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const {
    apiKeyId,
    apiKeySecret,
    setApiKeyId,
    setApiKeySecret,
    saveToSession,
    clearSession,
    sessionError,
    isConnected,
    hydrated,
  } = useHiggsfieldApiKey();

  if (!hydrated) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg border border-studio-border-subtle bg-studio-panel px-3 py-2 text-xs font-medium text-studio-fg backdrop-blur-md transition-colors hover:border-studio-accent/30 hover:bg-studio-panel-strong"
      >
        API key
        {isConnected ? (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
            Connected
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          className="studio-dropdown-enter absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-studio-border-subtle bg-studio-bg-elevated p-4 shadow-2xl shadow-black/40"
        >
          <h2 className="text-sm font-medium text-studio-fg">Higgsfield API key</h2>
          <p className="mt-1 text-xs leading-relaxed text-studio-muted">
            Saved for this browser tab only (session storage). Used for Soul v2 and
            Seedance 2.5 jobs. Never written to git or server logs. Leave blank to
            rely on server env vars in local dev.
          </p>
          <div className="mt-3 grid gap-2">
            <label className="text-xs font-medium text-studio-fg" htmlFor={`${panelId}-id`}>
              Key ID
            </label>
            <input
              id={`${panelId}-id`}
              type="password"
              autoComplete="off"
              value={apiKeyId}
              onChange={(e) => setApiKeyId(e.target.value)}
              className="studio-input"
            />
            <label
              className="mt-1 text-xs font-medium text-studio-fg"
              htmlFor={`${panelId}-secret`}
            >
              Key secret
            </label>
            <input
              id={`${panelId}-secret`}
              type="password"
              autoComplete="off"
              value={apiKeySecret}
              onChange={(e) => setApiKeySecret(e.target.value)}
              className="studio-input"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (saveToSession()) setOpen(false);
              }}
              className="studio-btn-primary px-3 py-1.5 text-xs"
            >
              Save for session
            </button>
            <button
              type="button"
              onClick={clearSession}
              className="studio-btn-secondary px-3 py-1.5 text-xs"
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
