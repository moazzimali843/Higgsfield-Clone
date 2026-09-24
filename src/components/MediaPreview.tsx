import Image from "next/image";
import { PreviewVideo } from "@/components/PreviewVideo";
import type { PreviewMedia } from "@/lib/preview-media";
import { getStillImageSrc } from "@/lib/preview-media";

type MediaPreviewProps = {
  media: PreviewMedia;
  /** Tailwind aspect ratio class, e.g. aspect-video */
  aspectClass?: string;
  className?: string;
  priority?: boolean;
  showCredit?: boolean;
  /**
   * loop — autoplay video when type is video (detail/hero; respects reduced motion).
   * still — always show a still (cards/grids; avoids many simultaneous decoders).
   */
  motion?: "loop" | "still";
};

export function MediaPreview({
  media,
  aspectClass = "aspect-video",
  className = "",
  priority = false,
  showCredit = true,
  motion = "loop",
}: MediaPreviewProps) {
  const showStill = media.type === "image" || motion === "still";
  const stillSrc = getStillImageSrc(media);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-studio-panel ${aspectClass} ${className}`}
    >
      {showStill ? (
        <Image
          src={stillSrc}
          alt={media.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
        />
      ) : (
        <PreviewVideo src={media.src} poster={media.poster} alt={media.alt} />
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent"
        aria-hidden
      />
      {showCredit ? (
        <a
          href={media.credit.href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 z-10 rounded bg-black/50 px-2 py-0.5 text-[10px] text-zinc-300 backdrop-blur hover:text-white"
        >
          {media.credit.label}
        </a>
      ) : null}
    </div>
  );
}
