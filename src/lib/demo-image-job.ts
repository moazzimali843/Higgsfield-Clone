import {
  allDemoOutputUrls,
  demoOutputImagesByAspect,
} from "@/data/demo-output-images";
import type { DemoImageJobRequest, DemoImageJobResponse } from "@/lib/generation-types";
import {
  aspectRatioOptions,
  type AspectRatio,
} from "@/lib/studio-recipe";

const PROMPT_MAX_LENGTH = 4_000;
const MAX_EXCLUDE_URLS = 64;

/** Stable index for demo video clip selection (see demo-video-job). */
export function hashPromptForDemo(prompt: string): number {
  let hash = 0;
  for (let i = 0; i < prompt.length; i += 1) {
    hash = (hash * 31 + prompt.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export type PickDemoOutputOptions = {
  excludeUrls?: readonly string[];
  /** Returns a value in [0, 1). Defaults to Math.random. */
  random?: () => number;
};

export function parseExcludeOutputUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const urls: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const trimmed = entry.trim();
    if (!trimmed) continue;
    urls.push(trimmed);
    if (urls.length >= MAX_EXCLUDE_URLS) break;
  }
  return urls;
}

export function pickDemoOutputUrl(
  aspectRatio: AspectRatio,
  options: PickDemoOutputOptions = {},
): string {
  const exclude = new Set(options.excludeUrls ?? []);
  const random = options.random ?? Math.random;

  const aspectPool =
    demoOutputImagesByAspect[aspectRatio] ?? demoOutputImagesByAspect["1:1"];

  const pickFrom = (pool: readonly string[]): string => {
    const available = pool.filter((url) => !exclude.has(url));
    const candidates = available.length > 0 ? available : [...pool];
    const index = Math.floor(random() * candidates.length);
    return candidates[Math.min(index, candidates.length - 1)];
  };

  const aspectPick = pickFrom(aspectPool);
  if (!exclude.has(aspectPick)) {
    return aspectPick;
  }

  const catalog = allDemoOutputUrls();
  const catalogAvailable = catalog.filter((url) => !exclude.has(url));
  if (catalogAvailable.length > 0) {
    const index = Math.floor(random() * catalogAvailable.length);
    return catalogAvailable[index];
  }

  return aspectPick;
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

  const excludeOutputUrls = parseExcludeOutputUrls(record.excludeOutputUrls);

  return {
    ok: true,
    value: {
      prompt,
      aspectRatio: aspectRatio as AspectRatio,
      modelId,
      excludeOutputUrls,
    },
  };
}

export function runDemoImageJob(
  request: DemoImageJobRequest,
): DemoImageJobResponse {
  return {
    status: "completed",
    source: "demo",
    outputUrl: pickDemoOutputUrl(request.aspectRatio, {
      excludeUrls: request.excludeOutputUrls,
    }),
    usedDemoFallbackForModel: request.modelId !== "demo",
  };
}

/** Server-side pause so the composer can show a pending state. */
export const DEMO_JOB_DELAY_MS = 2_200;
