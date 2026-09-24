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
};

export type DemoImageJobResponse = {
  status: "completed";
  source: "demo";
  outputUrl: string;
  /** True when the user picked Soul v2 but Phase 4 still returns a demo sample. */
  usedDemoFallbackForModel: boolean;
};
