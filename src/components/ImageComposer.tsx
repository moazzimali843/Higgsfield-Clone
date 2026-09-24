"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DemoBadge } from "@/components/DemoBadge";
import { useClientHydrated } from "@/hooks/use-client-hydrated";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";
import type { DemoImageJobResponse } from "@/lib/generation-types";
import {
  validateReferenceImageFile,
  type ReferenceImageAttachment,
} from "@/lib/reference-image";
import {
  findLibraryGenerationById,
  libraryHrefForGeneration,
  recipeToComposerInitialValues,
} from "@/lib/composer-remix";
import { createLibraryGeneration } from "@/lib/studio-library";
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
  effectPresetId?: string;
  remixGenerationId?: string;
};

type JobPhase = "idle" | "pending" | "done" | "error";

export function ImageComposer({
  initialValues,
  presetName,
  unknownPresetId,
  effectPresetId,
  remixGenerationId,
}: ImageComposerProps) {
  const [prompt, setPrompt] = useState(initialValues.prompt);
  const [aspectRatio, setAspectRatio] = useState(initialValues.aspectRatio);
  const [modelId, setModelId] = useState(initialValues.modelId);
  const [reference, setReference] = useState<ReferenceImageAttachment | null>(
    null,
  );
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [jobPhase, setJobPhase] = useState<JobPhase>("idle");
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<DemoImageJobResponse | null>(null);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydrated = useClientHydrated();
  const { items, append } = useStudioLibrary();
  const remixGeneration =
    hydrated && remixGenerationId
      ? findLibraryGenerationById(items, remixGenerationId)
      : undefined;
  const remixAppliedRef = useRef<string | null>(null);

  const selectedModel = useMemo(
    () => composerModels.find((m) => m.id === modelId) ?? composerModels[0],
    [modelId],
  );

  const recipeEffectPresetId =
    effectPresetId ?? remixGeneration?.recipe.effectPresetId;

  function clearReference() {
    if (reference?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(reference.previewUrl);
    }
    setReference(null);
    setReferenceError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  useEffect(() => {
    return () => {
      if (reference?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(reference.previewUrl);
      }
    };
  }, [reference]);

  useEffect(() => {
    if (!remixGenerationId || !remixGeneration) return;
    if (remixAppliedRef.current === remixGenerationId) return;

    const values = recipeToComposerInitialValues(remixGeneration.recipe);
    setPrompt(values.prompt);
    setAspectRatio(values.aspectRatio);
    setModelId(values.modelId);
    setReference(null);
    setReferenceError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setJobPhase("idle");
    setJobError(null);
    setJobResult(null);
    setSavedToLibrary(false);
    remixAppliedRef.current = remixGenerationId;
  }, [remixGenerationId, remixGeneration]);

  function onReferenceSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const validation = validateReferenceImageFile(file);
    if (!validation.ok) {
      setReferenceError(validation.error);
      return;
    }
    if (reference?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(reference.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setReference({ fileName: file.name, previewUrl });
    setReferenceError(null);
  }

  async function onGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setJobError("Add a prompt before generating.");
      setJobPhase("error");
      return;
    }

    setJobPhase("pending");
    setJobError(null);
    setJobResult(null);
    setSavedToLibrary(false);

    try {
      const response = await fetch("/api/demo/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          aspectRatio,
          modelId,
        }),
      });

      const payload = (await response.json()) as
        | DemoImageJobResponse
        | { error?: string };

      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Demo job failed. Try again.";
        throw new Error(message);
      }

      const result = payload as DemoImageJobResponse;
      setJobResult(result);
      setJobPhase("done");

      const generation = createLibraryGeneration({
        outputUrl: result.outputUrl,
        recipe: {
          prompt: trimmed,
          aspectRatio,
          modelId,
          effectPresetId: recipeEffectPresetId,
          referenceFileName: reference?.fileName,
        },
      });
      const saved = append(generation);
      setSavedToLibrary(saved);
    } catch (error) {
      setJobPhase("error");
      setJobError(
        error instanceof Error ? error.message : "Demo job failed. Try again.",
      );
    }
  }

  const generateDisabled = jobPhase === "pending";
  const resultAspectClass = aspectClassForRatio(aspectRatio);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
      <div className="flex flex-col gap-6">
        {presetName ? (
          <p className="rounded-lg border border-studio-accent/30 bg-studio-accent/10 px-4 py-3 text-sm text-studio-fg">
            Loaded preset:{" "}
            <span className="font-medium text-studio-accent">{presetName}</span>
            . Tweak the prompt or settings, then generate a labeled demo.
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
        {hydrated && remixGenerationId && !remixGeneration ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            No library item with that id.{" "}
            <Link href="/library" className="text-studio-accent hover:underline">
              Open Library
            </Link>{" "}
            or start from a blank composer.
          </p>
        ) : null}
        {remixGeneration ? (
          <p className="rounded-lg border border-studio-accent/30 bg-studio-accent/10 px-4 py-3 text-sm text-studio-fg">
            Remix loaded from your{" "}
            <Link
              href={libraryHrefForGeneration(remixGeneration.id)}
              className="font-medium text-studio-accent hover:underline"
            >
              library recipe
            </Link>
            . Tweak anything, then generate again.
            {remixGeneration.recipe.referenceFileName ? (
              <span className="mt-2 block text-xs text-studio-muted">
                Re-attach reference &ldquo;
                {remixGeneration.recipe.referenceFileName}&rdquo; if you still
                want it in the recipe.
              </span>
            ) : null}
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
            Attach a still for your recipe. Demo jobs use a sample output; real
            Soul uploads ship in Phase 7.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-3 block w-full text-sm text-studio-muted file:mr-3 file:rounded-lg file:border-0 file:bg-studio-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-studio-accent/90"
            onChange={(e) => onReferenceSelected(e.target.files)}
          />
          {referenceError ? (
            <p className="mt-2 text-xs text-amber-200" role="alert">
              {referenceError}
            </p>
          ) : null}
          {reference ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-studio-border"
              >
                <Image
                  src={reference.previewUrl}
                  alt={`Reference ${reference.fileName}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-studio-fg">
                  {reference.fileName}
                </p>
                <button
                  type="button"
                  onClick={clearReference}
                  className="mt-2 text-sm text-studio-accent hover:underline"
                >
                  Remove reference
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {jobPhase === "done" && jobResult ? (
          <div className="rounded-xl border border-studio-border bg-studio-panel p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-medium text-studio-fg">Result</h2>
              <DemoBadge />
            </div>
            {jobResult.usedDemoFallbackForModel ? (
              <p className="mt-2 text-xs text-amber-100">
                Soul v2 real renders need your API key in Phase 7. This output is
                still a labeled demo sample.
              </p>
            ) : null}
            <div
              className={`relative mt-4 w-full max-w-md overflow-hidden rounded-lg ${resultAspectClass}`}
            >
              <Image
                src={jobResult.outputUrl}
                alt="Demo generation result"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            {savedToLibrary ? (
              <p className="mt-3 text-xs text-studio-muted">
                Saved to your{" "}
                <Link href="/library" className="text-studio-accent hover:underline">
                  Library
                </Link>
                .
              </p>
            ) : (
              <p className="mt-3 text-xs text-amber-200" role="status">
                Result shown here, but browser storage was full or blocked — not
                saved to Library.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-xl border border-studio-border bg-studio-panel p-4">
          <h2 className="text-sm font-medium text-studio-fg">Generate</h2>
          <p className="mt-2 text-xs leading-relaxed text-studio-muted">
            Demo jobs run on our server with a short pending state, then return a
            labeled sample image stored in your browser library.
          </p>
          <button
            type="button"
            disabled={generateDisabled}
            onClick={onGenerate}
            aria-describedby="generate-phase-note"
            className="mt-4 w-full rounded-lg bg-studio-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-studio-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {jobPhase === "pending" ? "Generating…" : "Generate demo"}
          </button>
          <p id="generate-phase-note" className="mt-2 text-xs text-studio-muted">
            {jobPhase === "pending"
              ? "Pending — usually a couple of seconds."
              : "No API key required. Outputs are clearly marked Demo."}
          </p>
          {jobPhase === "error" && jobError ? (
            <p className="mt-2 text-xs text-amber-200" role="alert">
              {jobError}
            </p>
          ) : null}
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
