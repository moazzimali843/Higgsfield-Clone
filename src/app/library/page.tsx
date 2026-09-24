import type { Metadata } from "next";
import Link from "next/link";
import { LibraryPageClient } from "@/components/LibraryPageClient";
import { StudioPageHeader } from "@/components/StudioPageHeader";
import { getPreviewMedia } from "@/lib/preview-media";

export const metadata: Metadata = {
  title: "Library",
  description: "Browser-stored demo generations and recipes.",
};

export default function LibraryPage() {
  const heroMedia = getPreviewMedia("/library");

  return (
    <div className="flex flex-col gap-12">
      <StudioPageHeader
        eyebrow="Library"
        title="Your generations"
        description={
          <>
            Demo results from the image and video composers live here in this
            browser. No account and no server database. Clear site data to
            reset.
          </>
        }
        actions={
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/image"
              className="text-studio-accent-bright hover:underline"
            >
              Create another image
            </Link>
            <Link
              href="/video"
              className="text-studio-accent-bright hover:underline"
            >
              Create a video
            </Link>
          </div>
        }
        heroMedia={heroMedia}
        heroAspectClass="aspect-[3/4]"
        heroMaxWidth="max-w-xs"
      />

      <LibraryPageClient />
    </div>
  );
}
