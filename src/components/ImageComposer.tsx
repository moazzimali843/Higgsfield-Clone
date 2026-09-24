"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { GenerationSourceBadge } from "@/components/GenerationSourceBadge";
import { MotionReveal } from "@/components/MotionReveal";
import { ShimmerBlock } from "@/components/ShimmerBlock";
import { useHiggsfieldApiKey } from "@/components/HiggsfieldApiKeyProvider";
import { useClientHydrated } from "@/hooks/use-client-hydrated";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import {
  findLibraryGenerationById,
  libraryHrefForGeneration,
  recipeToComposerInitialValues,
} from "@/lib/composer-remix";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";
import type {
  DemoImageJobResponse,
  HiggsfieldEstimateResponse,
  ImageJobResponse,
} from "@/lib/generation-types";
import {
  REFERENCE_IMAGE_MAX_LABEL,
  validateReferenceImageFile,
  type ReferenceImageAttachment,
} from "@/lib/reference-image";
import { runSoulV2ImageInBrowser } from "@/lib/soul-image-browser";
import { createLibraryGeneration } from "@/lib/studio-library";
import {
  aspectRatioOptions,
  composerModels,
  type AspectRatio,
  type ImageComposerInitialValues,
} from "@/lib/studio-recipe";

const SOUL_V2_MODEL_ID = "soul-v2-standard";

type ImageComposerProps = {
  initialValues: ImageComposerInitialValues;
  presetName?: string;
  unknownPresetId?: string;
  effectPresetId?: string;
  remixGenerationId?: string;
};

type JobPhase = "idle" | "pending" | "done" | "error";

type EstimatePhase = "idle" | "loading" | "done" | "error";

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
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const { apiKeyId, setApiKeyId, apiKeySecret, setApiKeySecret } =
    useHiggsfieldApiKey();
  const [estimatePhase, setEstimatePhase] = useState<EstimatePhase>("idle");
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<HiggsfieldEstimateResponse | null>(
    null,
  );
  const [jobPhase, setJobPhase] = useState<JobPhase>("idle");
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<ImageJobResponse | null>(null);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remixAppliedRef = useRef<string | null>(null);
  const hydrated = useClientHydrated();
  const { items, append } = useStudioLibrary();

  const remixGeneration = useMemo(() => {
    if (!hydrated || !remixGenerationId) return undefined;
    return findLibraryGenerationById(items, remixGenerationId);
  }, [hydrated, remixGenerationId, items]);

  const recipeEffectPresetId =
    remixGeneration?.recipe.effectPresetId ?? effectPresetId;

  const libraryOutputUrls = useMemo(
    () => items.map((item) => item.outputUrl),
    [items],
  );

  const isSoulModel = modelId === SOUL_V2_MODEL_ID;

  const selectedModel = useMemo(
    () => composerModels.find((m) => m.id === modelId) ?? composerModels[0],
    [modelId],
  );

  function resetEstimate() {
    setEstimate(null);
    setEstimatePhase("idle");
    setEstimateError(null);
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
    setReferenceFile(null);
    setReferenceError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    resetEstimate();
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
    setReferenceFile(file);
    setReferenceError(null);
    resetEstimate();
  }

  function clearReference() {
    if (reference?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(reference.previewUrl);
    }
    setReference(null);
    setReferenceFile(null);
    setReferenceError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    resetEstimate();
  }

  async function onFetchEstimate() {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setEstimateError("Add a prompt before estimating cost.");
      setEstimatePhase("error");
      return;
    }
    if (!apiKeyId.trim() || !apiKeySecret.trim()) {
      setEstimateError(
        "Enter your Higgsfield API key ID and secret to see credits and USD.",
      );
      setEstimatePhase("error");
      return;
    }

    setEstimatePhase("loading");
    setEstimateError(null);

    try {
      const response = await fetch("/api/higgsfield/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          aspectRatio,
          apiKeyId: apiKeyId.trim(),
          apiKeySecret: apiKeySecret.trim(),
        }),
      });
      const payload = (await response.json()) as
        | HiggsfieldEstimateResponse
        | { error?: string };
      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Could not fetch estimate.";
        throw new Error(message);
      }
      setEstimate(payload as HiggsfieldEstimateResponse);
      setEstimatePhase("done");
    } catch (error) {
      setEstimatePhase("error");
      setEstimateError(
        error instanceof Error ? error.message : "Could not fetch estimate.",
      );
    }
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
      let result: ImageJobResponse;

      if (isSoulModel) {
        const keyId = apiKeyId.trim();
        const keySecret = apiKeySecret.trim();
        result = await runSoulV2ImageInBrowser({
          aspectRatio,
          apiKeyId: keyId,
          apiKeySecret: keySecret,
          excludeOutputUrls: libraryOutputUrls,
          usedReferenceUpload: Boolean(referenceFile),
          submit: () => {
            const form = new FormData();
            form.set("prompt", trimmed);
            form.set("aspectRatio", aspectRatio);
            if (keyId) form.set("apiKeyId", keyId);
            if (keySecret) form.set("apiKeySecret", keySecret);
            if (referenceFile) form.set("reference", referenceFile);
            if (libraryOutputUrls.length > 0) {
              form.set("excludeOutputUrls", JSON.stringify(libraryOutputUrls));
            }
            return fetch("/api/higgsfield/image", {
              method: "POST",
              body: form,
            });
          },
        });
      } else {
        const response = await fetch("/api/demo/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmed,
            aspectRatio,
            modelId,
            excludeOutputUrls: libraryOutputUrls,
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
        result = payload as DemoImageJobResponse;
      }

      setJobResult(result);
      setJobPhase("done");

      const generation = createLibraryGeneration({
        outputUrl: result.outputUrl,
        source: result.source,
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
        error instanceof Error ? error.message : "Generation failed. Try again.",
      );
    }
  }

  const generateDisabled = jobPhase === "pending";
  const resultAspectClass = aspectClassForRatio(aspectRatio);
  const resultUsesRemoteCdn =
    jobResult?.outputUrl.includes("images.pexels.com") === false;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
      <MotionReveal className="flex flex-col gap-6">
        {presetName ? (
          <p className="studio-alert-info">
            Loaded preset:{" "}
            <span className="font-medium text-studio-accent">{presetName}</span>
            . Tweak the prompt or settings, then generate.
          </p>
        ) : null}
        {unknownPresetId ? (
          <p className="studio-alert-warning">
            No preset named &ldquo;{unknownPresetId}&rdquo;. Starting from a
            blank composer instead.{" "}
            <Link href="/effects" className="text-studio-accent hover:underline">
              Browse Effects
            </Link>
          </p>
        ) : null}
        {hydrated && remixGenerationId && !remixGeneration ? (
          <p className="studio-alert-warning">
            No library item with that id.{" "}
            <Link href="/library" className="text-studio-accent hover:underline">
              Open Library
            </Link>{" "}
            or start from a blank composer.
          </p>
        ) : null}
        {remixGeneration ? (
          <p className="studio-alert-info">
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
            onChange={(e) => {
              resetEstimate();
              setPrompt(e.target.value);
            }}
            rows={6}
            className="studio-input mt-2 resize-y"
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
              onChange={(e) => {
                resetEstimate();
                setAspectRatio(e.target.value as AspectRatio);
              }}
              className="studio-input mt-2"
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
              onChange={(e) => {
                resetEstimate();
                setModelId(e.target.value);
              }}
              className="studio-input mt-2"
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

        {isSoulModel ? (
          <div className="studio-card p-5">
            <h2 className="text-sm font-medium text-studio-fg">
              Higgsfield API key
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-studio-muted">
              Demo stays the default on the Demo model. For Soul v2, use the header
              API key panel or the fields below. Keys are sent to our server for this
              request only, never stored in git. Real renders spend your credits.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="composer-api-key-id"
                  className="text-xs font-medium text-studio-fg"
                >
                  Key ID
                </label>
                <input
                  id="composer-api-key-id"
                  type="password"
                  autoComplete="off"
                  value={apiKeyId}
                  onChange={(e) => {
                    resetEstimate();
                    setApiKeyId(e.target.value);
                  }}
                  className="studio-input mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="composer-api-key-secret"
                  className="text-xs font-medium text-studio-fg"
                >
                  Key secret
                </label>
                <input
                  id="composer-api-key-secret"
                  type="password"
                  autoComplete="off"
                  value={apiKeySecret}
                  onChange={(e) => {
                    resetEstimate();
                    setApiKeySecret(e.target.value);
                  }}
                  className="studio-input mt-1"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-studio-muted">
              Local dev: you can also set{" "}
              <code className="text-studio-fg">HIGGSFIELD_KEY_ID</code> and{" "}
              <code className="text-studio-fg">HIGGSFIELD_KEY_SECRET</code> on
              the server instead of pasting keys in the UI.
            </p>
            <button
              type="button"
              disabled={estimatePhase === "loading"}
              onClick={onFetchEstimate}
              className="studio-btn-secondary mt-4 disabled:opacity-60"
            >
              {estimatePhase === "loading" ? "Estimating…" : "Estimate cost"}
            </button>
            {estimatePhase === "loading" ? (
              <div className="mt-3 space-y-2" aria-hidden>
                <ShimmerBlock className="h-3 w-2/3 rounded" label="Estimating cost" />
                <ShimmerBlock className="h-3 w-1/2 rounded" />
              </div>
            ) : null}
            {estimatePhase === "done" && estimate ? (
              <p className="mt-2 text-xs text-studio-fg">
                About{" "}
                <span className="font-medium">{estimate.credits}</span> credits
                (~${estimate.usd} USD) for this prompt.
              </p>
            ) : null}
            {estimatePhase === "error" && estimateError ? (
              <p className="mt-2 text-xs studio-alert-warning-xs" role="alert">
                {estimateError}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="studio-card border-dashed p-5">
          <p className="text-sm font-medium text-studio-fg">
            Reference image (optional)
          </p>
          <p className="mt-1 text-xs text-studio-muted">
            {isSoulModel
              ? `For Soul v2, we upload this server-side to Higgsfield storage (max ${REFERENCE_IMAGE_MAX_LABEL}, Vercel request limit).`
              : `Attach a still for your recipe (max ${REFERENCE_IMAGE_MAX_LABEL}). Demo jobs ignore the file and return a labeled sample.`}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-3 block w-full text-sm text-studio-muted file:mr-3 file:rounded-lg file:border-0 file:bg-studio-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-studio-accent/90"
            onChange={(e) => onReferenceSelected(e.target.files)}
          />
          {referenceError ? (
            <p className="mt-2 text-xs studio-alert-warning-xs" role="alert">
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
          <div className="studio-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-medium text-studio-fg">Result</h2>
              <GenerationSourceBadge source={jobResult.source} />
            </div>
            {jobResult.source === "demo" && jobResult.usedDemoFallbackForModel ? (
              <p className="mt-2 text-xs studio-alert-warning-xs">
                {jobResult.fallbackReason ??
                  "Soul v2 could not finish on the API. This is a labeled demo sample, not a paid render."}
              </p>
            ) : null}
            {jobResult.source === "higgsfield" ? (
              <p className="mt-2 text-xs text-studio-muted">
                {jobResult.retentionNote}
                {jobResult.usedReferenceUpload
                  ? " Reference image was uploaded for this job."
                  : null}
              </p>
            ) : null}
            <div
              className={`relative mt-4 w-full max-w-md overflow-hidden rounded-lg ${resultAspectClass}`}
            >
              <Image
                src={jobResult.outputUrl}
                alt="Generation result"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized={resultUsesRemoteCdn}
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
              <p className="mt-3 text-xs studio-alert-warning-xs" role="status">
                Result shown here, but browser storage was full or blocked. Not
                saved to Library.
              </p>
            )}
          </div>
        ) : null}
      </MotionReveal>

      <MotionReveal
        className="flex flex-col gap-4 lg:self-start"
        delay={140}
      >
        <div className="studio-card p-5 lg:sticky lg:top-24">
          <h2 className="studio-display text-sm font-semibold text-studio-fg">Generate</h2>
          <p className="mt-2 text-xs leading-relaxed text-studio-muted">
            {isSoulModel
              ? "Soul v2 runs on Higgsfield with your key. If the API fails, you get a labeled demo fallback, never a fake paid render."
              : "Demo jobs run on our server with a short pending state, then return a labeled sample image stored in your browser library."}
          </p>
          <button
            type="button"
            disabled={generateDisabled}
            onClick={onGenerate}
            aria-describedby="generate-phase-note"
            className={[
              "studio-btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60",
              jobPhase === "pending" ? "studio-btn-pending" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {jobPhase === "pending"
              ? "Generating…"
              : isSoulModel
                ? "Generate (Soul v2)"
                : "Generate demo"}
          </button>
          <p id="generate-phase-note" className="mt-2 text-xs text-studio-muted">
            {jobPhase === "pending"
              ? isSoulModel
                ? "Submitting to Higgsfield and polling. This can take a minute."
                : "Pending. Usually a couple of seconds."
              : isSoulModel
                ? "Requires a key in the form or server env vars."
                : "No API key required. Outputs are clearly marked Demo."}
          </p>
          {jobPhase === "error" && jobError ? (
            <p className="mt-2 text-xs studio-alert-warning-xs" role="alert">
              {jobError}
            </p>
          ) : null}
        </div>
        <Link
          href="/effects"
          className="text-center text-sm text-studio-accent hover:underline"
        >
          Back to Effects
        </Link>
      </MotionReveal>
    </div>
  );
}
