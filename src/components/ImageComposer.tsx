"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  aspectRatioOptions,
  composerModels,
  type AspectRatio,
  type ImageComposerInitialValues,
} from "@/lib/studio-recipe";

type ImageComposerProps = {
  initialValues: ImageComposerInitialValues;
  presetName?: string;
  unknownPresetId?: string;
};

export function ImageComposer({
  initialValues,
  presetName,
  unknownPresetId,
}: ImageComposerProps) {
  const [prompt, setPrompt] = useState(initialValues.prompt);
  const [aspectRatio, setAspectRatio] = useState(initialValues.aspectRatio);
  const [modelId, setModelId] = useState(initialValues.modelId);

  const selectedModel = useMemo(
    () => composerModels.find((m) => m.id === modelId) ?? composerModels[0],
    [modelId],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
      <div className="flex flex-col gap-6">
        {presetName ? (
          <p className="rounded-lg border border-studio-accent/30 bg-studio-accent/10 px-4 py-3 text-sm text-studio-fg">
            Loaded preset:{" "}
            <span className="font-medium text-studio-accent">{presetName}</span>
            . Tweak the prompt or settings, then generate when Phase 4 ships.
          </p>
        ) : null}
        {unknownPresetId ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            No preset named &ldquo;{unknownPresetId}&rdquo;. Starting from a
            blank composer instead.{" "}
            <Link href="/effects" className="text-studio-accent hover:underline">
              Browse Effects
            </Link>
          </p>
        ) : null}

        <div>
          <label
            htmlFor="composer-prompt"
            className="text-sm font-medium text-studio-fg"
          >
            Prompt
          </label>
          <textarea
            id="composer-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="mt-2 w-full resize-y rounded-lg border border-studio-border bg-studio-panel px-3 py-2 text-sm text-studio-fg placeholder:text-studio-muted focus:border-studio-accent/50 focus:outline-none focus:ring-2 focus:ring-studio-accent/20"
            placeholder="Describe the image you want…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="composer-aspect"
              className="text-sm font-medium text-studio-fg"
            >
              Aspect ratio
            </label>
            <select
              id="composer-aspect"
              value={aspectRatio}
              onChange={(e) =>
                setAspectRatio(e.target.value as AspectRatio)
              }
              className="mt-2 w-full rounded-lg border border-studio-border bg-studio-panel px-3 py-2 text-sm text-studio-fg focus:border-studio-accent/50 focus:outline-none focus:ring-2 focus:ring-studio-accent/20"
            >
              {aspectRatioOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="composer-model"
              className="text-sm font-medium text-studio-fg"
            >
              Model
            </label>
            <select
              id="composer-model"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-studio-border bg-studio-panel px-3 py-2 text-sm text-studio-fg focus:border-studio-accent/50 focus:outline-none focus:ring-2 focus:ring-studio-accent/20"
            >
              {composerModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-studio-muted">
              {selectedModel.description}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-studio-border bg-studio-panel/50 p-4">
          <p className="text-sm font-medium text-studio-fg">
            Reference image (optional)
          </p>
          <p className="mt-1 text-xs text-studio-muted">
            Upload and attach a reference in Phase 4 (demo) and Phase 7 (real
            Soul path). Field placeholder only for now.
          </p>
          <button
            type="button"
            disabled
            className="mt-3 cursor-not-allowed rounded-lg border border-studio-border px-3 py-2 text-sm text-studio-muted"
          >
            Add reference — Phase 4
          </button>
        </div>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-xl border border-studio-border bg-studio-panel p-4">
          <h2 className="text-sm font-medium text-studio-fg">Generate</h2>
          <p className="mt-2 text-xs leading-relaxed text-studio-muted">
            Demo jobs and labeled results land in Phase 4. Your recipe is ready;
            the button stays off so nothing looks broken.
          </p>
          <button
            type="button"
            disabled
            aria-describedby="generate-phase-note"
            className="mt-4 w-full cursor-not-allowed rounded-lg bg-studio-accent/40 px-4 py-2.5 text-sm font-medium text-studio-fg/80"
          >
            Generate (Phase 4)
          </button>
          <p id="generate-phase-note" className="mt-2 text-xs text-studio-muted">
            Pending → done flow and library storage come next.
          </p>
        </div>
        <Link
          href="/effects"
          className="text-center text-sm text-studio-accent hover:underline"
        >
          ← Back to Effects
        </Link>
      </aside>
    </div>
  );
}
