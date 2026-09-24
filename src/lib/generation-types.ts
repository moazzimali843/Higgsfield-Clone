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

export type LibraryGeneration = {
  id: string;
  createdAt: string;
  source: GenerationSource;
  mediaType: "image";
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

export type HiggsfieldEstimateResponse = {
  credits: string;
  usd: string;
};
