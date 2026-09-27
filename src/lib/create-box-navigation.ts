import { aspectRatioOptions, getComposerModelById, getVideoComposerModelById } from "@/lib/studio-recipe";

export type CreateMode = "image" | "video";

export type CreateBoxFields = {
  mode: CreateMode;
  prompt: string;
  modelId?: string;
  aspectRatio?: string;
  /** When true, image/video pages start generation after navigation. */
  autorun?: boolean;
};

export function isCreatePromptValid(prompt: string): boolean {
  return prompt.trim().length > 0;
}

export function buildCreateHref(fields: CreateBoxFields): string | null {
  if (!isCreatePromptValid(fields.prompt)) {
    return null;
  }

  const trimmedPrompt = fields.prompt.trim();
  const params = new URLSearchParams();
  params.set("prompt", trimmedPrompt);

  if (fields.mode === "image") {
    if (
      fields.aspectRatio &&
      aspectRatioOptions.includes(
        fields.aspectRatio as (typeof aspectRatioOptions)[number],
      )
    ) {
      params.set("aspectRatio", fields.aspectRatio);
    }
    if (fields.modelId && getComposerModelById(fields.modelId)) {
      params.set("modelId", fields.modelId);
    }
    if (fields.autorun) {
      params.set("run", "1");
    }
    return `/image?${params.toString()}`;
  }

  if (fields.modelId && getVideoComposerModelById(fields.modelId)) {
    params.set("modelId", fields.modelId);
  }
  if (
    fields.aspectRatio &&
    aspectRatioOptions.includes(
      fields.aspectRatio as (typeof aspectRatioOptions)[number],
    )
  ) {
    params.set("aspectRatio", fields.aspectRatio);
  }
  return `/video?${params.toString()}`;
}
