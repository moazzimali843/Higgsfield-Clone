import { getEffectPresetById } from "@/data/effect-presets";
import {
  blankComposerValues,
  getComposerModelById,
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
