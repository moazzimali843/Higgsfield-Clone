"use client";

import Image from "next/image";
import { useId, useMemo, useRef, useState } from "react";
import {
  isCreatePromptValid,
  type CreateMode,
} from "@/lib/create-box-navigation";
import type { ReferenceImageAttachment } from "@/lib/reference-image";
import {
  aspectRatioOptions,
  composerModels,
  videoComposerModels,
  type AspectRatio,
} from "@/lib/studio-recipe";

const PROMPT_MAX_LENGTH = 2000;

function compactModelLabel(label: string): string {
  const withoutParen = label.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const first = withoutParen.split(/\s+/)[0] ?? label;
  return first.length > 12 ? `${first.slice(0, 11)}…` : first;
}

function ImageModeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={active ? "text-studio-fg" : "text-studio-muted"}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
      <path
        d="M3 16l5.5-5 4 3.5L17 10l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoModeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={active ? "text-studio-fg" : "text-studio-muted"}
    >
      <path
        d="M4 7.5A1.5 1.5 0 0 1 5.5 6h9A1.5 1.5 0 0 1 16 7.5v9A1.5 1.5 0 0 1 14.5 18h-9A1.5 1.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 10.5 20 8.5v7l-4-2v-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ModelStackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="5"
        width="12"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-studio-fg"
      />
      <rect
        x="8"
        y="8"
        width="12"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-studio-muted"
      />
    </svg>
  );
}

function modeToggleClass(active: boolean) {
  return [
    "studio-btn-icon studio-btn-icon--round shrink-0",
    active ? "studio-btn-icon--active" : "",
  ].join(" ");
}

export type StudioCreateBoxProps = {
  mode: CreateMode;
  prompt: string;
  selectedModelId: string;
  aspectRatio: AspectRatio;
  reference: ReferenceImageAttachment | null;
  referenceError: string | null;
  onModeChange: (mode: CreateMode) => void;
  onPromptChange: (prompt: string) => void;
  onModelChange: (modelId: string) => void;
  onAspectRatioChange: (aspectRatio: AspectRatio) => void;
  onReferenceSelected: (fileList: FileList | null) => void;
  onReferenceClear: () => void;
  onCreate: () => void;
  isSubmitting?: boolean;
  variant?: "hero" | "compact";
};

function AspectRatioIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="7"
        width="14"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ReferenceImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7.5A1.5 1.5 0 0 1 6.5 6h11A1.5 1.5 0 0 1 19 7.5v9A1.5 1.5 0 0 1 17.5 18h-11A1.5 1.5 0 0 1 5 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9.5" cy="10.5" r="1.25" fill="currentColor" />
      <path
        d="M5 15.5l3.5-3 3 2.5L14.5 12l4.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StudioCreateBox({
  mode,
  prompt,
  selectedModelId,
  aspectRatio,
  reference,
  referenceError,
  onModeChange,
  onPromptChange,
  onModelChange,
  onAspectRatioChange,
  onReferenceSelected,
  onReferenceClear,
  onCreate,
  isSubmitting = false,
  variant = "compact",
}: StudioCreateBoxProps) {
  const modeId = useId();
  const modelId = useId();
  const aspectId = useId();
  const referenceInputId = useId();
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const aspectMenuRef = useRef<HTMLDivElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [aspectMenuOpen, setAspectMenuOpen] = useState(false);

  const modelOptions = useMemo(
    () => (mode === "video" ? videoComposerModels : composerModels),
    [mode],
  );

  const selectedModel = modelOptions.find((m) => m.id === selectedModelId);
  const modelDisplayLabel = selectedModel
    ? compactModelLabel(selectedModel.label)
    : "Model";

  const canCreate = isCreatePromptValid(prompt) && !isSubmitting;

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canCreate) {
      e.preventDefault();
      onCreate();
    }
  };

  const setCreateMode = (next: CreateMode) => {
    onModeChange(next);
    setModelMenuOpen(false);
    setAspectMenuOpen(false);
  };

  const isCompact = variant === "compact";
  const shellClass = isCompact
    ? "studio-create-box rounded-2xl border border-studio-border-subtle bg-white p-4 shadow-sm"
    : "studio-create-box rounded-[1.25rem] border border-studio-border-subtle bg-white p-5 shadow-[0_1px_3px_rgba(9,9,11,0.06),0_8px_24px_-12px_rgba(9,9,11,0.08)] sm:p-6";

  return (
    <div className={shellClass}>
      <label htmlFor={`${modeId}-prompt`} className="sr-only">
        Describe what you want to create
      </label>
      <textarea
        id={`${modeId}-prompt`}
        value={prompt}
        maxLength={PROMPT_MAX_LENGTH}
        rows={isCompact ? 2 : 3}
        placeholder="What will you imagine?"
        className="min-h-[4.5rem] w-full resize-none border-0 bg-transparent text-base text-studio-fg placeholder:text-zinc-400 focus:outline-none focus:ring-0 sm:min-h-[5.5rem] sm:text-lg"
        onChange={(e) => onPromptChange(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={mode === "image"}
            aria-label="Image"
            className={modeToggleClass(mode === "image")}
            onClick={() => setCreateMode("image")}
          >
            <ImageModeIcon active={mode === "image"} />
          </button>
          <button
            type="button"
            aria-pressed={mode === "video"}
            aria-label="Video"
            className={modeToggleClass(mode === "video")}
            onClick={() => setCreateMode("video")}
          >
            <VideoModeIcon active={mode === "video"} />
          </button>
        </div>

        <span
          className="hidden h-6 w-px shrink-0 bg-studio-border-subtle sm:block"
          aria-hidden
        />

        <div ref={aspectMenuRef} className="relative">
          <button
            type="button"
            aria-expanded={aspectMenuOpen}
            aria-haspopup="listbox"
            aria-controls={`${aspectId}-menu`}
            className="studio-btn-ghost gap-2 py-1.5 pl-1 pr-2 text-sm font-semibold text-studio-fg"
            onClick={() => setAspectMenuOpen((open) => !open)}
            onBlur={(e) => {
              if (!aspectMenuRef.current?.contains(e.relatedTarget as Node)) {
                setAspectMenuOpen(false);
              }
            }}
          >
            <AspectRatioIcon />
            <span>{aspectRatio}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              aria-hidden
              className={
                aspectMenuOpen
                  ? "rotate-180 text-studio-muted transition-transform"
                  : "text-studio-muted transition-transform"
              }
            >
              <path fill="currentColor" d="M2.5 4.5 6 8l3.5-3.5H2.5z" />
            </svg>
          </button>

          {aspectMenuOpen ? (
            <ul
              id={`${aspectId}-menu`}
              role="listbox"
              aria-label="Aspect ratio"
              className="studio-dropdown-enter absolute left-0 top-full z-20 mt-2 min-w-[6rem] overflow-hidden rounded-xl border border-studio-border-subtle bg-white p-1 shadow-lg shadow-zinc-900/10"
            >
              {aspectRatioOptions.map((option) => {
                const selected = option === aspectRatio;
                return (
                  <li key={option} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={[
                        "studio-btn-menu-item px-3 py-2 text-sm text-studio-fg hover:bg-zinc-50",
                        selected ? "studio-btn-menu-item--selected" : "",
                      ].join(" ")}
                      onClick={() => {
                        onAspectRatioChange(option);
                        setAspectMenuOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <label htmlFor={aspectId} className="sr-only">
            Aspect ratio
          </label>
          <select
            id={aspectId}
            tabIndex={-1}
            aria-hidden
            value={aspectRatio}
            onChange={(e) =>
              onAspectRatioChange(e.target.value as AspectRatio)
            }
            className="sr-only"
          >
            {aspectRatioOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex items-center gap-1">
          <input
            ref={referenceInputRef}
            id={referenceInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              onReferenceSelected(e.target.files);
              if (referenceInputRef.current) {
                referenceInputRef.current.value = "";
              }
            }}
          />
          {reference ? (
            <div className="flex items-center gap-1.5 rounded-full border border-studio-border-subtle bg-zinc-50 py-0.5 pl-0.5 pr-2">
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={reference.previewUrl}
                  alt={`Reference ${reference.fileName}`}
                  fill
                  className="object-cover"
                  sizes="28px"
                  unoptimized
                />
              </div>
              <span className="max-w-[5.5rem] truncate text-xs font-medium text-studio-fg">
                {reference.fileName}
              </span>
              <button
                type="button"
                aria-label="Remove reference image"
                className="studio-btn-icon studio-btn-icon--round h-6 w-6 text-studio-muted"
                onClick={onReferenceClear}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                  <path
                    d="M3 3l6 6M9 3 3 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="studio-btn-ghost gap-2 py-1.5 pl-1 pr-2 text-sm font-semibold text-studio-fg"
              onClick={() => referenceInputRef.current?.click()}
            >
              <ReferenceImageIcon />
              <span className="hidden sm:inline">Reference</span>
            </button>
          )}
        </div>

        <div ref={modelMenuRef} className="relative">
          <button
            type="button"
            aria-expanded={modelMenuOpen}
            aria-haspopup="listbox"
            aria-controls={`${modelId}-menu`}
            className="studio-btn-ghost gap-2 py-1.5 pl-1 pr-2 text-sm font-semibold text-studio-fg"
            onClick={() => setModelMenuOpen((open) => !open)}
            onBlur={(e) => {
              if (!modelMenuRef.current?.contains(e.relatedTarget as Node)) {
                setModelMenuOpen(false);
              }
            }}
          >
            <ModelStackIcon />
            <span>{modelDisplayLabel}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              aria-hidden
              className={
                modelMenuOpen
                  ? "rotate-180 text-studio-muted transition-transform"
                  : "text-studio-muted transition-transform"
              }
            >
              <path fill="currentColor" d="M2.5 4.5 6 8l3.5-3.5H2.5z" />
            </svg>
          </button>

          {modelMenuOpen ? (
            <ul
              id={`${modelId}-menu`}
              role="listbox"
              aria-label="Model"
              className="studio-dropdown-enter absolute left-0 top-full z-20 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-studio-border-subtle bg-white p-1 shadow-lg shadow-zinc-900/10"
            >
              {modelOptions.map((m) => {
                const selected = m.id === selectedModelId;
                return (
                  <li key={m.id} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={[
                        "studio-btn-menu-item px-3 py-2 text-sm text-studio-fg hover:bg-zinc-50",
                        selected ? "studio-btn-menu-item--selected" : "",
                      ].join(" ")}
                      onClick={() => {
                        onModelChange(m.id);
                        setModelMenuOpen(false);
                      }}
                    >
                      {m.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <label htmlFor={modelId} className="sr-only">
            Model
          </label>
          <select
            id={modelId}
            tabIndex={-1}
            aria-hidden
            value={selectedModelId}
            onChange={(e) => onModelChange(e.target.value)}
            className="sr-only"
          >
            {modelOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!canCreate}
          aria-disabled={!canCreate}
          aria-busy={isSubmitting}
          onClick={onCreate}
          className={[
            "studio-btn-primary ml-auto px-6",
            isSubmitting ? "studio-btn-pending" : "",
          ].join(" ")}
        >
          {isSubmitting ? "Creating…" : "Create"}
        </button>
      </div>
      {referenceError ? (
        <p className="mt-2 text-left text-xs studio-alert-warning-xs" role="alert">
          {referenceError}
        </p>
      ) : null}
    </div>
  );
}
