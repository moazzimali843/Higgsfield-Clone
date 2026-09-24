"use client";

import { useEffect, useState } from "react";

type PreviewVideoProps = {
  src: string;
  poster?: string;
  alt: string;
  /** Grid/list thumbnails should not autoplay (many decoders + motion). Default on for hero/result. */
  autoplay?: boolean;
};

export function PreviewVideo({
  src,
  poster,
  alt,
  autoplay = true,
}: PreviewVideoProps) {
  const [useStill, setUseStill] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setUseStill(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (useStill && poster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- poster fallback only
      <img
        src={poster}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      poster={autoplay ? poster : undefined}
      autoPlay={autoplay}
      muted
      loop={autoplay}
      playsInline
      preload={autoplay ? "auto" : "metadata"}
      aria-label={alt}
    />
  );
}
