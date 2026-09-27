"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudioCreate } from "@/components/StudioCreateProvider";
import { idleStudioImageJobState } from "@/components/StudioCreateImageResult";
import { MotionReveal } from "@/components/MotionReveal";
import { ShimmerBlock } from "@/components/ShimmerBlock";
import { useHiggsfieldApiKey } from "@/components/HiggsfieldApiKeyProvider";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import type {
  DemoImageJobResponse,
  HiggsfieldEstimateResponse,
  ImageJobResponse,
} from "@/lib/generation-types";
import { userFacingHiggsfieldErrorMessage } from "@/lib/higgsfield-client";
import { runSoulV2ImageInBrowser } from "@/lib/soul-image-browser";
import { createLibraryGeneration } from "@/lib/studio-library";
import { type ImageComposerInitialValues } from "@/lib/studio-recipe";

const SOUL_V2_MODEL_ID = "soul-v2-standard";

type ImageComposerProps = {
  initialValues: ImageComposerInitialValues;
};

type JobPhase = "idle" | "pending" | "done" | "error";

type EstimatePhase = "idle" | "loading" | "done" | "error";

export function ImageComposer({ initialValues }: ImageComposerProps) {
  const {
    prompt,
    modelId,
    aspectRatio,
    setPrompt,
    setModelId,
    setAspectRatio,
    reference,
    referenceFile,
    registerImageGenerate,
    reportImageJobState,
  } = useStudioCreate();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autorunHandledRef = useRef(false);
  const { credentials, setCredentials, apiKeyId, apiKeySecret, isConnected } =
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
  const { items, append } = useStudioLibrary();

  useEffect(() => {
    setPrompt(initialValues.prompt);
    setModelId(initialValues.modelId);
    setAspectRatio(initialValues.aspectRatio);
  }, [initialValues, setAspectRatio, setModelId, setPrompt]);

  const libraryOutputUrls = useMemo(
    () => items.map((item) => item.outputUrl),
    [items],
  );

  const isSoulModel = modelId === SOUL_V2_MODEL_ID;

  function resetEstimate() {
    setEstimate(null);
    setEstimatePhase("idle");
    setEstimateError(null);
  }

  useEffect(() => {
    resetEstimate();
  }, [aspectRatio, referenceFile]);

  async function onFetchEstimate() {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setEstimateError("Add a prompt before estimating cost.");
      setEstimatePhase("error");
      return;
    }
    if (!isConnected) {
      setEstimateError("Add API credentials to estimate cost.");
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
          apiCredentials: credentials.trim(),
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
      const raw =
        error instanceof Error ? error.message : "Could not fetch estimate.";
      setEstimateError(userFacingHiggsfieldErrorMessage(raw));
    }
  }

  const onGenerate = useCallback(async () => {
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
        const creds = credentials.trim();
        result = await runSoulV2ImageInBrowser({
          aspectRatio,
          apiKeyId: apiKeyId.trim(),
          apiKeySecret: apiKeySecret.trim(),
          excludeOutputUrls: libraryOutputUrls,
          usedReferenceUpload: Boolean(referenceFile),
          submit: () => {
            const form = new FormData();
            form.set("prompt", trimmed);
            form.set("aspectRatio", aspectRatio);
            if (creds) form.set("apiCredentials", creds);
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
              : "Generation failed. Try again.";
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
          referenceFileName: reference?.fileName,
        },
      });
      const saved = append(generation);
      setSavedToLibrary(saved);
    } catch (error) {
      setJobPhase("error");
      const raw =
        error instanceof Error ? error.message : "Generation failed. Try again.";
      setJobError(userFacingHiggsfieldErrorMessage(raw));
    }
  }, [
    credentials,
    apiKeyId,
    apiKeySecret,
    append,
    aspectRatio,
    isSoulModel,
    modelId,
    prompt,
    reference,
    referenceFile,
    libraryOutputUrls,
  ]);

  useEffect(() => {
    registerImageGenerate(() => {
      void onGenerate();
    });
    return () => registerImageGenerate(null);
  }, [onGenerate, registerImageGenerate]);

  useEffect(() => {
    reportImageJobState({
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
    reportImageJobState,
    savedToLibrary,
  ]);

  useEffect(() => {
    return () => {
      reportImageJobState(idleStudioImageJobState);
    };
  }, [reportImageJobState]);

  useEffect(() => {
    if (searchParams.get("run") !== "1") return;
    if (autorunHandledRef.current) return;
    if (!prompt.trim()) return;

    autorunHandledRef.current = true;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("run");
    const qs = params.toString();
    router.replace(qs ? `/image?${qs}` : "/image", { scroll: false });
    void onGenerate();
  }, [onGenerate, prompt, router, searchParams]);

  if (!isSoulModel) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <MotionReveal className="flex flex-col gap-6">
        <div className="studio-card p-5">
            <h2 className="text-sm font-medium text-studio-fg">API credentials</h2>
            <div className="mt-4">
              <label
                htmlFor="image-api-credentials"
                className="text-xs font-medium text-studio-fg"
              >
                API credentials
              </label>
              <input
                id="image-api-credentials"
                type="password"
                autoComplete="off"
                placeholder="your-api-key-id:your-api-key-secret"
                value={credentials}
                onChange={(e) => {
                  resetEstimate();
                  setCredentials(e.target.value);
                }}
                className="studio-input mt-1"
              />
            </div>
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

      </MotionReveal>
    </div>
  );
}
