import type { Metadata } from "next";
import { StudioPageHeader } from "@/components/StudioPageHeader";
import { VideoComposer } from "@/components/VideoComposer";
import { getPreviewMedia } from "@/lib/preview-media";
import { blankVideoComposerValues } from "@/lib/studio-recipe";

export const metadata: Metadata = {
  title: "Video",
  description: "Compose a short clip from a prompt and run a labeled demo job.",
};

export default function VideoPage() {
  const heroMedia = getPreviewMedia("/video");

  return (
    <div className="flex flex-col gap-12">
      <StudioPageHeader
        eyebrow="Video composer"
        title="Write the recipe"
        description={
          <>
            Same compose and generate loop as Image: run Demo or Seedance 2.5 jobs
            and keep finished clips in your browser library automatically.
          </>
        }
        heroMedia={heroMedia}
        heroAspectClass="aspect-video"
        heroMaxWidth="max-w-md"
        heroMotion="loop"
      />

      <VideoComposer initialValues={blankVideoComposerValues} />
    </div>
  );
}
