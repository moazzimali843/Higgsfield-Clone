import type { AspectRatio } from "@/lib/studio-recipe";

function pexelsOutput(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;
}

/** Labeled demo samples — stable Pexels stills, not paid API renders. */
export const demoOutputImagesByAspect: Record<AspectRatio, readonly string[]> = {
  "1:1": [
    pexelsOutput(774909),
    pexelsOutput(1858175),
    pexelsOutput(1183266),
  ],
  "16:9": [
    pexelsOutput(2832382),
    pexelsOutput(268533),
    pexelsOutput(414612),
  ],
  "9:16": [
    pexelsOutput(1183266),
    pexelsOutput(2832382),
    pexelsOutput(1858175),
  ],
  "4:3": [
    pexelsOutput(414612),
    pexelsOutput(268533),
    pexelsOutput(774909),
  ],
  "3:4": [
    pexelsOutput(1858175),
    pexelsOutput(1183266),
    pexelsOutput(774909),
  ],
};
