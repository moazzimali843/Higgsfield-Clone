import type { Metadata } from "next";
import Link from "next/link";
import { LibraryPageClient } from "@/components/LibraryPageClient";
import { getPreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";

export const metadata: Metadata = {
  title: "Library",
  description: "Browser-stored demo generations and recipes.",
};

export default function LibraryPage() {
  const heroMedia = getPreviewMedia("/library");

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-studio-accent">
            Library
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-studio-fg sm:text-4xl">
            Your generations
          </h1>
          <p className="mt-4 text-base leading-relaxed text-studio-muted">
            Demo results from the image composer live here in this browser. No
            account and no server database — clear site data to reset.
          </p>
          <Link
            href="/image"
            className="mt-4 inline-block text-sm text-studio-accent hover:underline"
          >
            Create another image →
          </Link>
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

      <LibraryPageClient />
    </div>
  );
}
