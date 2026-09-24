import type { AspectRatio } from "@/lib/studio-recipe";

function pexelsVideoOutput(id: number): string {
  return `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_25fps.mp4`;
}

/** Labeled demo clips — stable Pexels samples, not paid API renders. */
export const demoOutputVideosByAspect: Record<AspectRatio, readonly string[]> = {
  "1:1": [
    pexelsVideoOutput(1409899),
    pexelsVideoOutput(3195394),
    pexelsVideoOutput(856973),
  ],
  "16:9": [
    pexelsVideoOutput(3195394),
    pexelsVideoOutput(856973),
    pexelsVideoOutput(1409899),
  ],
  "9:16": [
    pexelsVideoOutput(1409899),
    pexelsVideoOutput(3195394),
    pexelsVideoOutput(856973),
  ],
  "4:3": [
    pexelsVideoOutput(856973),
    pexelsVideoOutput(3195394),
    pexelsVideoOutput(1409899),
  ],
  "3:4": [
    pexelsVideoOutput(3195394),
    pexelsVideoOutput(1409899),
    pexelsVideoOutput(856973),
  ],
};
