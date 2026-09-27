import { MotionReveal } from "@/components/MotionReveal";
import type { PreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";
import { StudioPageIntro } from "@/components/StudioPageIntro";

type StudioPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** @deprecated Prefer heroGallery */
  heroMedia?: PreviewMedia | null;
  heroGallery?: PreviewMedia[];
  heroAspectClass?: string;
  /** Tailwind max-width utilities for the preview row; default is full content width. */
  heroMaxWidth?: string;
  heroMotion?: "loop" | "still";
};

function resolveHeroGallery(
  heroGallery: PreviewMedia[] | undefined,
  heroMedia: PreviewMedia | null | undefined,
): PreviewMedia[] {
  if (heroGallery?.length) return heroGallery;
  if (heroMedia) return [heroMedia];
  return [];
}

export function StudioPageHeader({
  eyebrow,
  title,
  description,
  actions,
  heroMedia,
  heroGallery,
  heroAspectClass = "aspect-square",
  heroMaxWidth = "",
  heroMotion = "loop",
}: StudioPageHeaderProps) {
  const gallery = resolveHeroGallery(heroGallery, heroMedia);

  if (gallery.length === 0) {
    return (
      <StudioPageIntro
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />
    );
  }

  return (
    <header className="flex w-full flex-col gap-5">
      <StudioPageIntro
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />
      <MotionReveal
        className={["w-full", heroMaxWidth].filter(Boolean).join(" ")}
        delay={120}
      >
        <ul
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          aria-label="Preview gallery"
        >
          {gallery.map((media, index) => (
            <li key={`${media.src}-${index}`} className="min-w-0">
              <div className="studio-card overflow-hidden p-0.5">
                <MediaPreview
                  media={media}
                  motion={media.type === "video" ? heroMotion : "still"}
                  aspectClass={heroAspectClass}
                  showCredit={false}
                  priority={index === 0}
                  className="rounded-[calc(var(--studio-radius)-4px)]"
                />
              </div>
            </li>
          ))}
        </ul>
      </MotionReveal>
    </header>
  );
}
