"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStudioCreate } from "@/components/StudioCreateProvider";
import { idleStudioVideoJobState } from "@/components/StudioCreateVideoResult";
import { MotionReveal } from "@/components/MotionReveal";
import { useHiggsfieldApiKey } from "@/components/HiggsfieldApiKeyProvider";
import { useStudioGenerationAuth } from "@/hooks/use-studio-generation-auth";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import { userFacingHiggsfieldErrorMessage } from "@/lib/higgsfield-client";
import type { DemoVideoJobResponse, VideoJobResponse } from "@/lib/generation-types";
import { runSeedanceVideoInBrowser } from "@/lib/seedance-video-browser";
import { createLibraryGeneration } from "@/lib/studio-library";
import { refreshAuthedStudioLibrary } from "@/lib/studio-library-client";
import {
  isSeedanceVideoModelId,
  SEEDANCE_VIDEO_MODEL_ID,
  SEEDANCE_VIDEO_MODEL_ID_LEGACY,
  type VideoComposerInitialValues,
} from "@/lib/studio-recipe";

type VideoComposerProps = {
  initialValues: VideoComposerInitialValues;
};

type JobPhase = "idle" | "pending" | "done" | "error";

export function VideoComposer({ initialValues }: VideoComposerProps) {
  const {
    prompt,
    modelId,
    aspectRatio,
    setPrompt,
    setModelId,
    setAspectRatio,
    reference,
    registerVideoGenerate,
    reportVideoJobState,
  } = useStudioCreate();
  const [jobPhase, setJobPhase] = useState<JobPhase>("idle");
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<VideoJobResponse | null>(null);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const { items, append, cloudMode, hydrated: libraryHydrated } =
    useStudioLibrary();
  const { ensureSignedInForGeneration } = useStudioGenerationAuth();

  const libraryOutputUrls = useMemo(
    () => items.map((item) => item.outputUrl),
    [items],
  );
  const { credentials, setCredentials, apiKeyId, apiKeySecret } =
    useHiggsfieldApiKey();

  useEffect(() => {
    setPrompt(initialValues.prompt);
    setModelId(initialValues.modelId);
    setAspectRatio(initialValues.aspectRatio);
  }, [initialValues, setAspectRatio, setModelId, setPrompt]);

  const isSeedanceModel = isSeedanceVideoModelId(modelId);

  useEffect(() => {
    if (modelId === SEEDANCE_VIDEO_MODEL_ID_LEGACY) {
      setModelId(SEEDANCE_VIDEO_MODEL_ID);
    }
  }, [modelId]);

  useEffect(() => {
    reportVideoJobState({
      phase: jobPhase,
      error: jobError,
      result: jobResult,
      savedToLibrary,
      aspectRatio,
    });
  }, [
    aspectRatio,
    jobError,
    jobPhase,
    jobResult,
    reportVideoJobState,
    savedToLibrary,
  ]);

  useEffect(() => {
    return () => {
      reportVideoJobState(idleStudioVideoJobState);
    };
  }, [reportVideoJobState]);

  const onGenerate = useCallback(async () => {
    if (!ensureSignedInForGeneration()) {
      return;
    }
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
      if (cloudMode && !libraryHydrated) {
        await refreshAuthedStudioLibrary();
      }

      let result: VideoJobResponse;

      if (isSeedanceModel) {
        const creds = credentials.trim();
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
                apiCredentials: creds || undefined,
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
            excludeOutputUrls: libraryOutputUrls,
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
              : "Generation failed. Try again.";
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
      const saved = await append(generation);
      setSavedToLibrary(saved);
    } catch (error) {
      setJobPhase("error");
      const raw =
        error instanceof Error ? error.message : "Generation failed. Try again.";
      setJobError(userFacingHiggsfieldErrorMessage(raw));
    }
  }, [
    cloudMode,
    credentials,
    apiKeyId,
    apiKeySecret,
    append,
    aspectRatio,
    ensureSignedInForGeneration,
    isSeedanceModel,
    libraryHydrated,
    libraryOutputUrls,
    modelId,
    prompt,
    reference,
  ]);

  useEffect(() => {
    registerVideoGenerate(() => {
      void onGenerate();
    });
    return () => registerVideoGenerate(null);
  }, [onGenerate, registerVideoGenerate]);

  if (!isSeedanceModel) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <MotionReveal className="flex flex-col gap-6">
        <div className="studio-card max-w-md p-5">
          <h2 className="text-sm font-medium text-studio-fg">API credentials</h2>
          <div className="mt-4">
            <label
              htmlFor="video-api-credentials"
              className="text-xs font-medium text-studio-fg"
            >
              API credentials
            </label>
            <input
              id="video-api-credentials"
              type="password"
              autoComplete="off"
              placeholder="your-api-key-id:your-api-key-secret"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              className="studio-input mt-1"
            />
          </div>
        </div>
      </MotionReveal>
    </div>
  );
}
