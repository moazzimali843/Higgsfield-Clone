import type { AspectRatio } from "@/lib/studio-recipe";

export function aspectClassForRatio(ratio: AspectRatio): string {
  switch (ratio) {
    case "16:9":
      return "aspect-video";
    case "9:16":
      return "aspect-[9/16]";
    case "4:3":
      return "aspect-[4/3]";
    case "3:4":
      return "aspect-[3/4]";
    case "1:1":
    default:
      return "aspect-square";
  }
}
