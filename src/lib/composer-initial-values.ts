import { getEffectPresetById } from "@/data/effect-presets";
import {
  aspectRatioOptions,
  blankComposerValues,
  getComposerModelById,
  type AspectRatio,
  type ImageComposerInitialValues,
} from "@/lib/studio-recipe";

export type ComposerPageState = {
  initialValues: ImageComposerInitialValues;
  presetName?: string;
  unknownPresetId?: string;
};

export function resolveComposerFromPresetParam(
  presetParam: string | undefined,
): ComposerPageState {
  if (!presetParam) {
    return { initialValues: blankComposerValues };
  }

  const preset = getEffectPresetById(presetParam);
  if (!preset) {
    return {
      initialValues: blankComposerValues,
      unknownPresetId: presetParam,
    };
  }

  const modelId =
    getComposerModelById(preset.settings.modelId)?.id ?? "demo";

  return {
    presetName: preset.name,
    initialValues: {
      prompt: preset.prompt,
      aspectRatio: preset.settings.aspectRatio,
      modelId,
    },
  };
}

export type ComposerRemixQuery = {
  prompt?: string;
  aspectRatio?: string;
  modelId?: string;
};

export function applyComposerRemixQuery(
  base: ImageComposerInitialValues,
  remix: ComposerRemixQuery,
): ImageComposerInitialValues {
  const prompt =
    remix.prompt !== undefined ? remix.prompt : base.prompt;
  const aspectRatio =
    remix.aspectRatio &&
    aspectRatioOptions.includes(remix.aspectRatio as AspectRatio)
      ? (remix.aspectRatio as AspectRatio)
      : base.aspectRatio;
  const modelId =
    remix.modelId && getComposerModelById(remix.modelId)
      ? remix.modelId
      : base.modelId;

  return { prompt, aspectRatio, modelId };
}

export function resolveComposerPageState(
  presetParam: string | undefined,
  remix: ComposerRemixQuery,
): ComposerPageState {
  const fromPreset = resolveComposerFromPresetParam(presetParam);
  const hasRemix =
    remix.prompt !== undefined ||
    remix.aspectRatio !== undefined ||
    remix.modelId !== undefined;

  if (!hasRemix) {
    return fromPreset;
  }

  return {
    ...fromPreset,
    initialValues: applyComposerRemixQuery(fromPreset.initialValues, remix),
  };
}
