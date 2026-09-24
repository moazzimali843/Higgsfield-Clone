import Link from "next/link";
import { MotionReveal } from "@/components/MotionReveal";
import type { NavItem } from "@/lib/navigation";
import { getPreviewMedia } from "@/lib/preview-media";
import { StudioPageHero } from "@/components/StudioPageHero";

type ComingSoonPageProps = {
  item: NavItem;
};

export function ComingSoonPage({ item }: ComingSoonPageProps) {
  const media = getPreviewMedia(item.href);

  return (
    <div className="mx-auto max-w-3xl">
      {media ? (
        <StudioPageHero media={media} eyebrow="Coming soon" title={item.label}>
          {item.description ? (
            <p className="mt-4 text-base leading-relaxed text-studio-muted">
              {item.description}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-studio-muted">
            This route stays on the map so navigation stays honest. Core work
            lives in Effects, Image, and Library.
          </p>
        </StudioPageHero>
      ) : (
        <>
          <p className="studio-eyebrow">Coming soon</p>
          <h1 className="studio-display mt-3 text-3xl font-semibold tracking-tight text-studio-fg">
            {item.label}
          </h1>
        </>
      )}
      <MotionReveal className="mt-10 flex flex-wrap gap-3" delay={160}>
        <Link href="/effects" className="studio-btn-primary">
          Browse Effects
        </Link>
        <Link href="/image" className="studio-btn-secondary">
          Open Image composer
        </Link>
        <Link href="/" className="studio-btn-ghost">
          Back to Home
        </Link>
      </MotionReveal>
    </div>
  );
}
