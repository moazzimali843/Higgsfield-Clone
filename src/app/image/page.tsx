import type { Metadata } from "next";
import { ImageComposer } from "@/components/ImageComposer";
import { StudioPageHeader } from "@/components/StudioPageHeader";
import { resolveComposerPageState } from "@/lib/composer-initial-values";
import { firstQueryValue } from "@/lib/search-params";
import { getPreviewMedia } from "@/lib/preview-media";

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
    remix?: string | string[];
  }>;
};

export default async function ImagePage({ searchParams }: ImagePageProps) {
  const params = await searchParams;
  const presetId = firstQueryValue(params.preset);
  const remixId = firstQueryValue(params.remix);
  const { initialValues, presetName, unknownPresetId } =
    resolveComposerPageState(presetId, {
      prompt: firstQueryValue(params.prompt),
      aspectRatio: firstQueryValue(params.aspectRatio),
      modelId: firstQueryValue(params.modelId),
    });
  const heroMedia = getPreviewMedia("/image");

  return (
    <div className="flex flex-col gap-12">
      <StudioPageHeader
        eyebrow="Image composer"
        title="Write the recipe"
        description={
          <>
            Start blank or arrive from an Effect preset, then run a labeled demo
            job. Finished images land in your browser library automatically.
          </>
        }
        heroMedia={heroMedia}
        heroAspectClass="aspect-[3/4]"
        heroMaxWidth="max-w-xs"
      />

      <ImageComposer
        key={`${presetId ?? "blank"}-${remixId ?? "no-remix"}-${initialValues.prompt.slice(0, 32)}-${initialValues.modelId}`}
        initialValues={initialValues}
        presetName={presetName}
        unknownPresetId={unknownPresetId}
        remixGenerationId={remixId}
        effectPresetId={
          presetId && !unknownPresetId ? presetId : undefined
        }
      />
    </div>
  );
}
