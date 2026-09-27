import type { Metadata } from "next";
import Link from "next/link";
import { LibraryPageClient } from "@/components/LibraryPageClient";
import { StudioPageHeader } from "@/components/StudioPageHeader";
export const metadata: Metadata = {
  title: "Library",
  description: "Your saved generations and recipes.",
};

export default function LibraryPage() {
  return (
    <div className="flex flex-col gap-8">
      <StudioPageHeader
        eyebrow="Library"
        title="Your generations"
        description="Saved creations plus the Image and Video showcase — everything in one place."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/image" className="studio-btn-primary">
              Create another image
            </Link>
            <Link href="/video" className="studio-btn-secondary">
              Create a video
            </Link>
          </div>
        }
      />

      <LibraryPageClient />
    </div>
  );
}
