import Link from "next/link";
import { MotionReveal } from "@/components/MotionReveal";
import { StudioPageIntro } from "@/components/StudioPageIntro";
import type { NavItem } from "@/lib/navigation";
import { getPreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";

type ComingSoonPageProps = {
  item: NavItem;
};

export function ComingSoonPage({ item }: ComingSoonPageProps) {
  const media = getPreviewMedia(item.href);

  return (
    <div className="w-full max-w-4xl">
      <StudioPageIntro
        eyebrow="Coming soon"
        title={item.label}
        description={
          item.description ? <p>{item.description}</p> : "Not available yet."
        }
      />

      {media ? (
        <MotionReveal className="mt-8" delay={80}>
          <div className="studio-card overflow-hidden p-1">
            <MediaPreview
              media={media}
              aspectClass="aspect-[16/10] sm:aspect-[16/9]"
              showCredit={false}
              className="rounded-[calc(var(--studio-radius)-4px)]"
            />
          </div>
        </MotionReveal>
      ) : null}

      <MotionReveal className="mt-10" delay={160}>
        <Link href="/" className="studio-btn-primary">
          Back to Home
        </Link>
      </MotionReveal>
    </div>
  );
}
