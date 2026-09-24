import type { AspectRatio } from "@/lib/studio-recipe";

/** How the output was produced. */
export type GenerationSource = "demo" | "higgsfield";

export type GenerationRecipe = {
  prompt: string;
  aspectRatio: AspectRatio;
  modelId: string;
  effectPresetId?: string;
  referenceFileName?: string;
};

export type LibraryMediaType = "image" | "video";

export type LibraryGeneration = {
  id: string;
  createdAt: string;
  source: GenerationSource;
  mediaType: LibraryMediaType;
  outputUrl: string;
  recipe: GenerationRecipe;
};

export type DemoImageJobRequest = {
  prompt: string;
  aspectRatio: AspectRatio;
  modelId: string;
  /** Demo URLs already saved in the browser library — avoid repeats when possible. */
  excludeOutputUrls?: string[];
};

export type DemoImageJobResponse = {
  status: "completed";
  source: "demo";
  outputUrl: string;
  /** True when Soul v2 was selected but output is still a labeled demo sample. */
  usedDemoFallbackForModel: boolean;
  /** Present when a real job failed and we returned demo instead. */
  fallbackReason?: string;
};

export type HiggsfieldImageJobResponse = {
  status: "completed";
  source: "higgsfield";
  outputUrl: string;
  requestId: string;
  retentionNote: string;
  usedReferenceUpload?: boolean;
};

export type DemoFallbackImageJobResponse = DemoImageJobResponse & {
  usedDemoFallbackForModel: true;
  fallbackReason: string;
};

export type ImageJobResponse =
  | DemoImageJobResponse
  | HiggsfieldImageJobResponse
  | DemoFallbackImageJobResponse;

/** Soul submit succeeded; browser polls `/api/higgsfield/image/poll`. */
export type SoulImageSubmitPollingResponse = {
  phase: "polling";
  statusUrl: string;
  requestId: string;
  usedReferenceUpload?: boolean;
};

export type SoulImagePollInProgressResponse = {
  phase: "polling";
  higgsfieldStatus: "queued" | "in_progress";
  requestId: string;
};

export type SoulImageSubmitResponse =
  | ImageJobResponse
  | SoulImageSubmitPollingResponse;

export type SoulImagePollResponse =
  | ImageJobResponse
  | SoulImagePollInProgressResponse;

export function isImageJobResponse(
  value: unknown,
): value is ImageJobResponse {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.status === "completed" &&
    typeof record.outputUrl === "string" &&
    (record.source === "demo" || record.source === "higgsfield")
  );
}

export function isSoulImagePollInProgressResponse(
  value: unknown,
): value is SoulImagePollInProgressResponse {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.phase === "polling" &&
    (record.higgsfieldStatus === "queued" ||
      record.higgsfieldStatus === "in_progress") &&
    typeof record.requestId === "string"
  );
}

export function isSoulImageSubmitPollingResponse(
  value: unknown,
): value is SoulImageSubmitPollingResponse {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.phase === "polling" &&
    typeof record.statusUrl === "string" &&
    typeof record.requestId === "string" &&
    record.higgsfieldStatus === undefined
  );
}

export type HiggsfieldEstimateResponse = {
  credits: string;
  usd: string;
};

export type DemoVideoJobRequest = DemoImageJobRequest;

export type DemoVideoJobResponse = {
  status: "completed";
  source: "demo";
  outputUrl: string;
  /** True when the user picked a non-demo video model label. */
  usedDemoFallbackForModel: boolean;
  fallbackReason?: string;
};

export type HiggsfieldVideoJobResponse = {
  status: "completed";
  source: "higgsfield";
  outputUrl: string;
  requestId: string;
  retentionNote: string;
};

export type DemoFallbackVideoJobResponse = DemoVideoJobResponse & {
  usedDemoFallbackForModel: true;
  fallbackReason: string;
};

export type VideoJobResponse =
  | DemoVideoJobResponse
  | HiggsfieldVideoJobResponse
  | DemoFallbackVideoJobResponse;

export type SeedanceVideoSubmitPollingResponse = {
  phase: "polling";
  statusUrl: string;
  requestId: string;
};

export type SeedanceVideoPollInProgressResponse = {
  phase: "polling";
  higgsfieldStatus: "queued" | "in_progress";
  requestId: string;
};

export type SeedanceVideoSubmitResponse =
  | VideoJobResponse
  | SeedanceVideoSubmitPollingResponse;

export type SeedanceVideoPollResponse =
  | VideoJobResponse
  | SeedanceVideoPollInProgressResponse;

export function isVideoJobResponse(
  value: unknown,
): value is VideoJobResponse {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.status === "completed" &&
    typeof record.outputUrl === "string" &&
    (record.source === "demo" || record.source === "higgsfield")
  );
}

export function isSeedanceVideoPollInProgressResponse(
  value: unknown,
): value is SeedanceVideoPollInProgressResponse {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.phase === "polling" &&
    (record.higgsfieldStatus === "queued" ||
      record.higgsfieldStatus === "in_progress") &&
    typeof record.requestId === "string"
  );
}

export function isSeedanceVideoSubmitPollingResponse(
  value: unknown,
): value is SeedanceVideoSubmitPollingResponse {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.phase === "polling" &&
    typeof record.statusUrl === "string" &&
    typeof record.requestId === "string" &&
    record.higgsfieldStatus === undefined
  );
}
