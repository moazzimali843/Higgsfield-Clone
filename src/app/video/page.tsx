import type { Metadata } from "next";
import { VideoComposer } from "@/components/VideoComposer";
import { getPreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";
import { blankVideoComposerValues } from "@/lib/studio-recipe";

export const metadata: Metadata = {
  title: "Video",
  description: "Compose a short clip from a prompt and run a labeled demo job.",
};

export default function VideoPage() {
  const heroMedia = getPreviewMedia("/video");

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-studio-accent">
            Video composer
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-studio-fg sm:text-4xl">
            Write the recipe
          </h1>
          <p className="mt-4 text-base leading-relaxed text-studio-muted">
            Same compose → generate loop as Image: run a labeled demo job and
            keep finished clips in your browser library automatically.
          </p>
        </div>
        {heroMedia ? (
          <div className="w-full max-w-xs shrink-0">
            <MediaPreview
              media={heroMedia}
              motion="loop"
              aspectClass="aspect-video"
              showCredit={false}
              className="ring-1 ring-studio-border"
            />
          </div>
        ) : null}
      </header>

      <VideoComposer initialValues={blankVideoComposerValues} />
    </div>
  );
}
