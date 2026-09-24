import { MotionReveal } from "@/components/MotionReveal";
import type { PreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";

type StudioPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  heroMedia?: PreviewMedia | null;
  heroAspectClass?: string;
  heroMaxWidth?: string;
  heroMotion?: "loop" | "still";
};

export function StudioPageHeader({
  eyebrow,
  title,
  description,
  actions,
  heroMedia,
  heroAspectClass = "aspect-[16/10]",
  heroMaxWidth = "max-w-md",
  heroMotion = "still",
}: StudioPageHeaderProps) {
  return (
    <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <MotionReveal className="max-w-2xl">
        <p className="studio-eyebrow">{eyebrow}</p>
        <h1 className="studio-display mt-3 text-3xl font-semibold tracking-tight text-studio-fg sm:text-4xl lg:text-[2.5rem]">
          {title}
        </h1>
        {description ? (
          <div className="mt-4 text-base leading-relaxed text-studio-muted">
            {description}
          </div>
        ) : null}
        {actions ? <div className="mt-5">{actions}</div> : null}
      </MotionReveal>
      {heroMedia ? (
        <MotionReveal className={`w-full ${heroMaxWidth} shrink-0`} delay={120}>
          <MediaPreview
            media={heroMedia}
            motion={heroMotion}
            aspectClass={heroAspectClass}
            showCredit={false}
            className="studio-media-ring studio-hero-media-enter"
          />
        </MotionReveal>
      ) : null}
    </header>
  );
}
