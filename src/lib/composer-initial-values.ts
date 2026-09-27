import {
  aspectRatioOptions,
  blankComposerValues,
  blankVideoComposerValues,
  getComposerModelById,
  getVideoComposerModelById,
  type AspectRatio,
  type ImageComposerInitialValues,
  type VideoComposerInitialValues,
} from "@/lib/studio-recipe";

export type ComposerPageState = {
  initialValues: ImageComposerInitialValues;
};

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
  remix: ComposerRemixQuery,
): ComposerPageState {
  const base = blankComposerValues;
  const hasRemix =
    remix.prompt !== undefined ||
    remix.aspectRatio !== undefined ||
    remix.modelId !== undefined;

  if (!hasRemix) {
    return { initialValues: base };
  }

  return {
    initialValues: applyComposerRemixQuery(base, remix),
  };
}

export type VideoComposerPageState = {
  initialValues: VideoComposerInitialValues;
};

export function applyVideoComposerRemixQuery(
  base: VideoComposerInitialValues,
  remix: ComposerRemixQuery,
): VideoComposerInitialValues {
  const prompt =
    remix.prompt !== undefined ? remix.prompt : base.prompt;
  const aspectRatio =
    remix.aspectRatio &&
    aspectRatioOptions.includes(remix.aspectRatio as AspectRatio)
      ? (remix.aspectRatio as AspectRatio)
      : base.aspectRatio;
  const modelId =
    remix.modelId && getVideoComposerModelById(remix.modelId)
      ? remix.modelId
      : base.modelId;

  return { prompt, aspectRatio, modelId };
}

export function resolveVideoComposerPageState(
  remix: ComposerRemixQuery,
): VideoComposerPageState {
  const base = blankVideoComposerValues;
  const hasRemix =
    remix.prompt !== undefined ||
    remix.aspectRatio !== undefined ||
    remix.modelId !== undefined;

  if (!hasRemix) {
    return { initialValues: base };
  }

  return {
    initialValues: applyVideoComposerRemixQuery(base, remix),
  };
}
