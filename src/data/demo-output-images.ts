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
    pexelsOutput(1222271),
    pexelsOutput(1563356),
    pexelsOutput(1681010),
    pexelsOutput(2102587),
    pexelsOutput(1024311),
    pexelsOutput(112618),
    pexelsOutput(325185),
  ],
  "16:9": [
    pexelsOutput(2832382),
    pexelsOutput(268533),
    pexelsOutput(414612),
    pexelsOutput(2387414),
    pexelsOutput(3402624),
    pexelsOutput(1090638),
    pexelsOutput(2559941),
    pexelsOutput(957024),
    pexelsOutput(1323712),
    pexelsOutput(147411),
  ],
  "9:16": [
    pexelsOutput(1183266),
    pexelsOutput(2832382),
    pexelsOutput(1858175),
    pexelsOutput(1687675),
    pexelsOutput(1926620),
    pexelsOutput(261651),
    pexelsOutput(1450363),
    pexelsOutput(3764011),
    pexelsOutput(2894944),
    pexelsOutput(1552242),
  ],
  "4:3": [
    pexelsOutput(414612),
    pexelsOutput(268533),
    pexelsOutput(774909),
    pexelsOutput(34950),
    pexelsOutput(33109),
    pexelsOutput(1667822),
    pexelsOutput(1761279),
    pexelsOutput(2070033),
    pexelsOutput(248797),
    pexelsOutput(1366919),
  ],
  "3:4": [
    pexelsOutput(1858175),
    pexelsOutput(1183266),
    pexelsOutput(774909),
    pexelsOutput(1130626),
    pexelsOutput(1450360),
    pexelsOutput(1926769),
    pexelsOutput(2894944),
    pexelsOutput(3764014),
    pexelsOutput(1552249),
    pexelsOutput(1687675),
  ],
};

/** Every demo URL in the catalog (for avoiding library duplicates). */
export function allDemoOutputUrls(): readonly string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const pool of Object.values(demoOutputImagesByAspect)) {
    for (const url of pool) {
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    }
  }
  return urls;
}
