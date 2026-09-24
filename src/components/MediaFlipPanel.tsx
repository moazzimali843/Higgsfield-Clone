import type { ReactNode } from "react";

type MediaFlipPanelProps = {
  front: ReactNode;
  back: ReactNode;
  aspectClass?: string;
  className?: string;
};

/**
 * Hover overlay on the media strip only — no 3D flip/tilt so the card stays stable.
 * Body copy below is always visible; touch devices keep the front media only.
 */
export function MediaFlipPanel({
  front,
  back,
  aspectClass = "aspect-[16/10]",
  className = "",
}: MediaFlipPanelProps) {
  return (
    <div
      className={[
        "studio-media-stack",
        aspectClass,
        "relative w-full shrink-0 overflow-hidden rounded-t-[calc(var(--studio-radius)-1px)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="studio-media-stack-base studio-foil-wrap relative h-full w-full">
        {front}
      </div>
      <div
        className="studio-media-stack-overlay pointer-events-none absolute inset-0 flex"
        aria-hidden
      >
        {back}
      </div>
    </div>
  );
}
