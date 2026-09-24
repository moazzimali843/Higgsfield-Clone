import Link from "next/link";
import type { NavItem } from "@/lib/navigation";
import { getPreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";
import { MediaFlipPanel } from "@/components/MediaFlipPanel";

type VisualFeatureCardProps = {
  item: NavItem;
  badge?: string;
  footer?: string;
  /** Larger bento tile styling */
  featured?: boolean;
};

export function VisualFeatureCard({
  item,
  badge,
  footer = "Open",
  featured = false,
}: VisualFeatureCardProps) {
  const media = getPreviewMedia(item.href);

  const mediaFront = media ? (
    <MediaPreview
      media={media}
      motion="still"
      aspectClass="aspect-[16/10] h-full min-h-full"
      showCredit={false}
      className="h-full min-h-full rounded-none"
    />
  ) : (
    <div className="h-full min-h-full bg-[#12121a]" />
  );

  const mediaBack = (
    <div className="studio-media-flip-back-panel">
      <p className="studio-eyebrow text-[10px]">Preview</p>
      <p className="studio-display text-xl font-semibold text-studio-fg sm:text-2xl">
        {item.label}
      </p>
      <p className="text-sm text-studio-muted">
        {item.description ?? "Open this area of the studio map."}
      </p>
    </div>
  );

  return (
      <Link
        href={item.href}
        className={[
          "studio-card studio-card-interactive studio-border-glow-card group/card flex h-full flex-col overflow-hidden",
          featured ? "studio-neo-soft" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <MediaFlipPanel
          aspectClass={featured ? "aspect-[16/11] sm:aspect-[16/10]" : "aspect-[16/10]"}
          front={mediaFront}
          back={mediaBack}
        />
        <div className="studio-card-body flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="studio-display text-lg font-semibold text-studio-fg transition-colors group-hover/card:text-studio-accent-bright">
              {item.label}
            </h3>
            {badge ? (
              <span className="shrink-0 rounded-md bg-[#16161f] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-studio-muted ring-1 ring-studio-border-subtle">
                {badge}
              </span>
            ) : null}
          </div>
          {item.description ? (
            <p className="mt-2 flex-1 text-sm leading-relaxed text-studio-muted">
              {item.description}
            </p>
          ) : null}
          <span className="mt-5 text-sm font-medium text-studio-accent-bright">
            {footer}
          </span>
        </div>
      </Link>
  );
}
