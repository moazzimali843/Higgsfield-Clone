import Link from "next/link";
import type { NavItem } from "@/lib/navigation";
import { getPreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";

type VisualFeatureCardProps = {
  item: NavItem;
  badge?: string;
  footer?: string;
};

export function VisualFeatureCard({
  item,
  badge,
  footer = "Open →",
}: VisualFeatureCardProps) {
  const media = getPreviewMedia(item.href);

  return (
    <Link
      href={item.href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-studio-border bg-studio-panel transition hover:border-studio-accent/40 hover:shadow-lg hover:shadow-studio-accent/5"
    >
      {media ? (
        <MediaPreview
          media={media}
          motion="still"
          aspectClass="aspect-[16/10]"
          showCredit={false}
          className="rounded-none rounded-t-xl"
        />
      ) : (
        <div className="aspect-[16/10] bg-studio-panel" />
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-studio-fg group-hover:text-studio-accent">
            {item.label}
          </h3>
          {badge ? (
            <span
              className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-studio-muted ring-1 ring-studio-border"
            >
              {badge}
            </span>
          ) : null}
        </div>
        {item.description ? (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-studio-muted">
            {item.description}
          </p>
        ) : null}
        <span className="mt-4 text-sm font-medium text-studio-accent">
          {footer}
        </span>
      </div>
    </Link>
  );
}
