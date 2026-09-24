/** Shared recipe shape for effect presets and the image composer (Phases 3–5). */

export const aspectRatioOptions = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;

export type AspectRatio = (typeof aspectRatioOptions)[number];

export type StudioRecipeSettings = {
  aspectRatio: AspectRatio;
  /** Display id for the model picker; real API mapping lands in Phase 7. */
  modelId: string;
};

export type ComposerModelOption = {
  id: string;
  label: string;
  description: string;
};

/** Small list shown in the image composer model picker. */
export const composerModels: ComposerModelOption[] = [
  {
    id: "demo",
    label: "Demo",
    description: "Labeled sample output. No API key required.",
  },
  {
    id: "soul-v2-standard",
    label: "Soul v2 (standard)",
    description:
      "Real Soul v2 render. Uses your Higgsfield API key for this job.",
  },
];

export function getComposerModelById(
  modelId: string,
): ComposerModelOption | undefined {
  return composerModels.find((m) => m.id === modelId);
}

export type ImageComposerInitialValues = {
  prompt: string;
  aspectRatio: AspectRatio;
  modelId: string;
};

/** Canonical Seedance id; `seedance-display` remains in older library recipes. */
export const SEEDANCE_VIDEO_MODEL_ID = "seedance-2.5";
export const SEEDANCE_VIDEO_MODEL_ID_LEGACY = "seedance-display";

/** Small list shown in the video composer model picker. */
export const videoComposerModels: ComposerModelOption[] = [
  {
    id: "demo",
    label: "Demo",
    description: "Labeled sample clip. No API key required.",
  },
  {
    id: SEEDANCE_VIDEO_MODEL_ID,
    label: "Seedance 2.5",
    description: "Real Seedance 2.5 clip. Uses your Higgsfield API key.",
  },
];

export function isSeedanceVideoModelId(modelId: string): boolean {
  return (
    modelId === SEEDANCE_VIDEO_MODEL_ID ||
    modelId === SEEDANCE_VIDEO_MODEL_ID_LEGACY
  );
}

export function getVideoComposerModelById(
  modelId: string,
): ComposerModelOption | undefined {
  const direct = videoComposerModels.find((m) => m.id === modelId);
  if (direct) return direct;
  if (modelId === SEEDANCE_VIDEO_MODEL_ID_LEGACY) {
    return videoComposerModels.find((m) => m.id === SEEDANCE_VIDEO_MODEL_ID);
  }
  return undefined;
}

export type VideoComposerInitialValues = ImageComposerInitialValues;

export const blankComposerValues: ImageComposerInitialValues = {
  prompt: "",
  aspectRatio: "1:1",
  modelId: "demo",
};

export const blankVideoComposerValues: VideoComposerInitialValues = {
  prompt: "",
  aspectRatio: "16:9",
  modelId: "demo",
};

