import type { PreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";

type StudioPageHeroProps = {
  media: PreviewMedia;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
};

export function StudioPageHero({
  media,
  eyebrow,
  title,
  children,
}: StudioPageHeroProps) {
  return (
    <div className="flex flex-col gap-8">
      <MediaPreview
        media={media}
        aspectClass="aspect-[21/9] sm:aspect-[2.4/1]"
        priority
        className="studio-media-ring"
        showCredit={false}
      />
      <div className="max-w-2xl">
        <p className="studio-eyebrow">{eyebrow}</p>
        <h1 className="studio-display mt-3 text-3xl font-semibold tracking-tight text-studio-fg sm:text-4xl">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
