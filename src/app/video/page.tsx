import type { Metadata } from "next";
import { StudioPageHeader } from "@/components/StudioPageHeader";
import { VideoComposer } from "@/components/VideoComposer";
import { resolveVideoComposerPageState } from "@/lib/composer-initial-values";
import { firstQueryValue } from "@/lib/search-params";
import { getPreviewGallery } from "@/lib/preview-media";

export const metadata: Metadata = {
  title: "Video",
  description: "Create a short clip from a prompt and save it to your library.",
};

type VideoPageProps = {
  searchParams: Promise<{
    prompt?: string | string[];
    aspectRatio?: string | string[];
    modelId?: string | string[];
  }>;
};

export default async function VideoPage({ searchParams }: VideoPageProps) {
  const params = await searchParams;
  const { initialValues } = resolveVideoComposerPageState({
    prompt: firstQueryValue(params.prompt),
    aspectRatio: firstQueryValue(params.aspectRatio),
    modelId: firstQueryValue(params.modelId),
  });
  const heroGallery = getPreviewGallery("/video");

  return (
    <div className="flex flex-col gap-8">
      <StudioPageHeader
        eyebrow="Video"
        title="Write the recipe"
        description="Set your prompt and options, then create. Results save to your library."
        heroGallery={heroGallery}
        heroAspectClass="aspect-video"
        heroMotion="loop"
      />

      <VideoComposer
        key={`video-${initialValues.prompt.slice(0, 32)}-${initialValues.modelId}-${initialValues.aspectRatio}`}
        initialValues={initialValues}
      />
    </div>
  );
}
