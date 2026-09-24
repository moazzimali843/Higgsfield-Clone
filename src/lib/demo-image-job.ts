import { demoOutputImagesByAspect } from "@/data/demo-output-images";
import type { DemoImageJobRequest, DemoImageJobResponse } from "@/lib/generation-types";
import {
  aspectRatioOptions,
  type AspectRatio,
} from "@/lib/studio-recipe";

const PROMPT_MAX_LENGTH = 4_000;

export function hashPromptForDemo(prompt: string): number {
  let hash = 0;
  for (let i = 0; i < prompt.length; i += 1) {
    hash = (hash * 31 + prompt.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function pickDemoOutputUrl(
  prompt: string,
  aspectRatio: AspectRatio,
): string {
  const pool =
    demoOutputImagesByAspect[aspectRatio] ?? demoOutputImagesByAspect["1:1"];
  const index = hashPromptForDemo(prompt) % pool.length;
  return pool[index];
}

export function parseDemoImageJobRequest(
  body: unknown,
): { ok: true; value: DemoImageJobRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const record = body as Record<string, unknown>;
  const prompt =
    typeof record.prompt === "string" ? record.prompt.trim() : "";
  if (!prompt) {
    return { ok: false, error: "Prompt is required." };
  }
  if (prompt.length > PROMPT_MAX_LENGTH) {
    return {
      ok: false,
      error: `Prompt must be at most ${PROMPT_MAX_LENGTH} characters.`,
    };
  }

  const aspectRatio = record.aspectRatio;
  if (
    typeof aspectRatio !== "string" ||
    !aspectRatioOptions.includes(aspectRatio as AspectRatio)
  ) {
    return { ok: false, error: "Invalid aspect ratio." };
  }

  const modelId =
    typeof record.modelId === "string" && record.modelId.trim()
      ? record.modelId.trim()
      : "demo";

  return {
    ok: true,
    value: {
      prompt,
      aspectRatio: aspectRatio as AspectRatio,
      modelId,
    },
  };
}

export function runDemoImageJob(
  request: DemoImageJobRequest,
): DemoImageJobResponse {
  return {
    status: "completed",
    source: "demo",
    outputUrl: pickDemoOutputUrl(request.prompt, request.aspectRatio),
    usedDemoFallbackForModel: request.modelId !== "demo",
  };
}

/** Server-side pause so the composer can show a pending state. */
export const DEMO_JOB_DELAY_MS = 2_200;
