import type { AspectRatio } from "@/lib/studio-recipe";

/** How the output was produced. Phase 4 only uses demo. */
export type GenerationSource = "demo";

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
};

export type DemoImageJobResponse = {
  status: "completed";
  source: "demo";
  outputUrl: string;
  /** True when the user picked Soul v2 but Phase 4 still returns a demo sample. */
  usedDemoFallbackForModel: boolean;
};

export type DemoVideoJobRequest = DemoImageJobRequest;

export type DemoVideoJobResponse = {
  status: "completed";
  source: "demo";
  outputUrl: string;
  /** True when the user picked a non-demo video model label. */
  usedDemoFallbackForModel: boolean;
};
