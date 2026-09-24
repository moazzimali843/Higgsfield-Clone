import type { AspectRatio } from "@/lib/studio-recipe";

/** Rough footer height relative to one column width (prompt, meta, remix link). */
const FOOTER_HEIGHT = 1.65;
const REFERENCE_LINE_HEIGHT = 0.35;

export function aspectImageHeightFactor(ratio: AspectRatio): number {
  switch (ratio) {
    case "16:9":
      return 9 / 16;
    case "9:16":
      return 16 / 9;
    case "4:3":
      return 4 / 3;
    case "3:4":
      return 3 / 4;
    case "1:1":
    default:
      return 1;
  }
}

export function estimatedLibraryCardHeight(recipe: {
  aspectRatio: AspectRatio;
  referenceFileName?: string;
}): number {
  let footer = FOOTER_HEIGHT;
  if (recipe.referenceFileName) {
    footer += REFERENCE_LINE_HEIGHT;
  }
  return aspectImageHeightFactor(recipe.aspectRatio) + footer;
}

export function distributeToShortestColumns<T>(
  items: T[],
  columnCount: number,
  heightOf: (item: T) => number,
): T[][] {
  const count = Math.max(1, columnCount);
  const columns: T[][] = Array.from({ length: count }, () => []);
  const heights = Array<number>(count).fill(0);

  for (const item of items) {
    let target = 0;
    for (let i = 1; i < count; i++) {
      if (heights[i] < heights[target]) {
        target = i;
      }
    }
    columns[target].push(item);
    heights[target] += heightOf(item);
  }

  return columns;
}
