import { Suspense } from "react";
import type { Metadata } from "next";
import { ImageComposer } from "@/components/ImageComposer";
import { StudioPageHeader } from "@/components/StudioPageHeader";
import { resolveComposerPageState } from "@/lib/composer-initial-values";
import { firstQueryValue } from "@/lib/search-params";
import { getPreviewGallery } from "@/lib/preview-media";

export const metadata: Metadata = {
  title: "Image",
  description: "Create an image from a prompt and save it to your library.",
};

type ImagePageProps = {
  searchParams: Promise<{
    prompt?: string | string[];
    aspectRatio?: string | string[];
    modelId?: string | string[];
  }>;
};

export default async function ImagePage({ searchParams }: ImagePageProps) {
  const params = await searchParams;
  const { initialValues } = resolveComposerPageState({
    prompt: firstQueryValue(params.prompt),
    aspectRatio: firstQueryValue(params.aspectRatio),
    modelId: firstQueryValue(params.modelId),
  });
  const heroGallery = getPreviewGallery("/image");

  return (
    <div className="flex flex-col gap-8">
      <StudioPageHeader
        eyebrow="Image"
        title="Write the recipe"
        description="Set your prompt and options, then create. Results save to your library."
        heroGallery={heroGallery}
        heroAspectClass="aspect-[4/5]"
      />

      <Suspense fallback={null}>
        <ImageComposer
          key={`${initialValues.prompt.slice(0, 32)}-${initialValues.modelId}`}
          initialValues={initialValues}
        />
      </Suspense>
    </div>
  );
}
