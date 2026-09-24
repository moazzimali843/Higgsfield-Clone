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
    description: "Labeled sample output — no API key required.",
  },
  {
    id: "soul-v2-standard",
    label: "Soul v2 (standard)",
    description:
      "Real Soul v2 render — paste your Higgsfield API key for this job only.",
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

/** Small list shown in the video composer model picker. */
export const videoComposerModels: ComposerModelOption[] = [
  {
    id: "demo",
    label: "Demo",
    description: "Labeled sample clip — no API key required.",
  },
  {
    id: "seedance-display",
    label: "Seedance (display)",
    description: "Real video render with your API key — optional in a later phase.",
  },
];

export function getVideoComposerModelById(
  modelId: string,
): ComposerModelOption | undefined {
  return videoComposerModels.find((m) => m.id === modelId);
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

