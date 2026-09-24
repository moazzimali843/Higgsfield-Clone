import type { Metadata } from "next";
import { ImageComposer } from "@/components/ImageComposer";
import { resolveComposerPageState } from "@/lib/composer-initial-values";
import { firstQueryValue } from "@/lib/search-params";
import { getPreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";

export const metadata: Metadata = {
  title: "Image",
  description: "Compose an image from a prompt or an effect preset.",
};

type ImagePageProps = {
  searchParams: Promise<{
    preset?: string | string[];
    prompt?: string | string[];
    aspectRatio?: string | string[];
    modelId?: string | string[];
  }>;
};

export default async function ImagePage({ searchParams }: ImagePageProps) {
  const params = await searchParams;
  const presetId = firstQueryValue(params.preset);
  const { initialValues, presetName, unknownPresetId } =
    resolveComposerPageState(presetId, {
      prompt: firstQueryValue(params.prompt),
      aspectRatio: firstQueryValue(params.aspectRatio),
      modelId: firstQueryValue(params.modelId),
    });
  const heroMedia = getPreviewMedia("/image");

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-studio-accent">
            Image composer
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-studio-fg sm:text-4xl">
            Write the recipe
          </h1>
          <p className="mt-4 text-base leading-relaxed text-studio-muted">
            Start blank or arrive from an Effect preset, then run a labeled demo
            job. Finished images land in your browser library automatically.
          </p>
        </div>
        {heroMedia ? (
          <div className="w-full max-w-xs shrink-0">
            <MediaPreview
              media={heroMedia}
              motion="still"
              aspectClass="aspect-[3/4]"
              showCredit={false}
              className="ring-1 ring-studio-border"
            />
          </div>
        ) : null}
      </header>

      <ImageComposer
        key={`${presetId ?? "blank"}-${initialValues.prompt.slice(0, 32)}-${initialValues.modelId}`}
        initialValues={initialValues}
        presetName={presetName}
        unknownPresetId={unknownPresetId}
        effectPresetId={
          presetId && !unknownPresetId ? presetId : undefined
        }
      />
    </div>
  );
}
