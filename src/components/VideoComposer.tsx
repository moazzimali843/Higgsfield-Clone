"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { GenerationSourceBadge } from "@/components/GenerationSourceBadge";
import { MotionReveal } from "@/components/MotionReveal";
import { useHiggsfieldApiKey } from "@/components/HiggsfieldApiKeyProvider";
import { PreviewVideo } from "@/components/PreviewVideo";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";
import type { DemoVideoJobResponse, VideoJobResponse } from "@/lib/generation-types";
import {
  validateReferenceImageFile,
  type ReferenceImageAttachment,
} from "@/lib/reference-image";
import { runSeedanceVideoInBrowser } from "@/lib/seedance-video-browser";
import { createLibraryGeneration } from "@/lib/studio-library";
import {
  aspectRatioOptions,
  getVideoComposerModelById,
  isSeedanceVideoModelId,
  SEEDANCE_VIDEO_MODEL_ID,
  SEEDANCE_VIDEO_MODEL_ID_LEGACY,
  videoComposerModels,
  type AspectRatio,
  type VideoComposerInitialValues,
} from "@/lib/studio-recipe";

type VideoComposerProps = {
  initialValues: VideoComposerInitialValues;
};

type JobPhase = "idle" | "pending" | "done" | "error";

export function VideoComposer({ initialValues }: VideoComposerProps) {
  const [prompt, setPrompt] = useState(initialValues.prompt);
  const [aspectRatio, setAspectRatio] = useState(initialValues.aspectRatio);
  const [modelId, setModelId] = useState(initialValues.modelId);
  const [reference, setReference] = useState<ReferenceImageAttachment | null>(
    null,
  );
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [jobPhase, setJobPhase] = useState<JobPhase>("idle");
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<VideoJobResponse | null>(null);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { append } = useStudioLibrary();
  const { apiKeyId, apiKeySecret } = useHiggsfieldApiKey();

  const isSeedanceModel = isSeedanceVideoModelId(modelId);

  const selectedModel = useMemo(
    () => getVideoComposerModelById(modelId) ?? videoComposerModels[0],
    [modelId],
  );

  useEffect(() => {
    if (modelId === SEEDANCE_VIDEO_MODEL_ID_LEGACY) {
      setModelId(SEEDANCE_VIDEO_MODEL_ID);
    }
  }, [modelId]);

  useEffect(() => {
    return () => {
      if (reference?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(reference.previewUrl);
      }
    };
  }, [reference]);

  function clearReference() {
    if (reference?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(reference.previewUrl);
    }
    setReference(null);
    setReferenceError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
      let result: VideoJobResponse;

      if (isSeedanceModel) {
        const keyId = apiKeyId.trim();
        const keySecret = apiKeySecret.trim();
        result = await runSeedanceVideoInBrowser({
          prompt: trimmed,
          aspectRatio,
          apiKeyId: keyId,
          apiKeySecret: keySecret,
          submit: () =>
            fetch("/api/higgsfield/video", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: trimmed,
                aspectRatio,
                apiKeyId: keyId || undefined,
                apiKeySecret: keySecret || undefined,
              }),
            }),
        });
      } else {
        const response = await fetch("/api/demo/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmed,
            aspectRatio,
            modelId,
          }),
        });

        const payload = (await response.json()) as
          | DemoVideoJobResponse
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
        result = payload as DemoVideoJobResponse;
      }

      setJobResult(result);
      setJobPhase("done");

      const generation = createLibraryGeneration({
        mediaType: "video",
        outputUrl: result.outputUrl,
        source: result.source,
        recipe: {
          prompt: trimmed,
          aspectRatio,
          modelId,
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
      <MotionReveal className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="video-composer-prompt"
            className="text-sm font-medium text-studio-fg"
          >
            Prompt
          </label>
          <textarea
            id="video-composer-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="studio-input mt-2 resize-y"
            placeholder="Describe the clip you want…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="video-composer-aspect"
              className="text-sm font-medium text-studio-fg"
            >
              Aspect ratio
            </label>
            <select
              id="video-composer-aspect"
              value={aspectRatio}
              onChange={(e) =>
                setAspectRatio(e.target.value as AspectRatio)
              }
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
              htmlFor="video-composer-model"
              className="text-sm font-medium text-studio-fg"
            >
              Model
            </label>
            <select
              id="video-composer-model"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="studio-input mt-2"
            >
              {videoComposerModels.map((model) => (
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

        <div className="studio-card border-dashed p-5">
          <p className="text-sm font-medium text-studio-fg">
            Reference image (optional)
          </p>
          <p className="mt-1 text-xs text-studio-muted">
            Attach a still for your recipe. Demo jobs return a labeled sample clip.
            Seedance 2.5 is text-to-video only in this app (reference is not sent).
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
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-studio-border">
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
              <GenerationSourceBadge source={jobResult.source} mediaType="video" />
            </div>
            {jobResult.source === "demo" && jobResult.usedDemoFallbackForModel ? (
              <p className="mt-2 text-xs studio-alert-warning-xs">
                {jobResult.fallbackReason ??
                  "Seedance 2.5 could not finish on the API. This is a labeled demo sample, not a paid render."}
              </p>
            ) : null}
            {jobResult.source === "higgsfield" ? (
              <p className="mt-2 text-xs text-studio-muted">
                {jobResult.retentionNote}
              </p>
            ) : null}
            <div
              className={`relative mt-4 w-full max-w-md overflow-hidden rounded-lg ${resultAspectClass}`}
            >
              <PreviewVideo
                src={jobResult.outputUrl}
                alt="Demo video generation result"
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
            {isSeedanceModel
              ? "Seedance 2.5 runs on Higgsfield with your key. If the API fails, you get a labeled demo fallback, never a fake paid render."
              : "Demo jobs run on our server with a short pending state, then return a labeled sample clip stored in your browser library."}
          </p>
          <button
            type="button"
            disabled={generateDisabled}
            onClick={onGenerate}
            aria-describedby="video-generate-phase-note"
            className={[
              "studio-btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60",
              jobPhase === "pending" ? "studio-btn-pending" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {jobPhase === "pending"
              ? "Generating…"
              : isSeedanceModel
                ? "Generate (Seedance 2.5)"
                : "Generate demo"}
          </button>
          <p
            id="video-generate-phase-note"
            className="mt-2 text-xs text-studio-muted"
          >
            {jobPhase === "pending"
              ? isSeedanceModel
                ? "Submitting to Higgsfield and polling. Video jobs can take a few minutes."
                : "Pending. Usually a couple of seconds."
              : isSeedanceModel
                ? "Requires a key in the header panel, composer, or server env vars."
                : "No API key required. Outputs are clearly marked Demo."}
          </p>
          {jobPhase === "error" && jobError ? (
            <p className="mt-2 text-xs studio-alert-warning-xs" role="alert">
              {jobError}
            </p>
          ) : null}
        </div>
        <Link
          href="/image"
          className="text-center text-sm text-studio-accent hover:underline"
        >
          Back to Image composer
        </Link>
      </MotionReveal>
    </div>
  );
}
