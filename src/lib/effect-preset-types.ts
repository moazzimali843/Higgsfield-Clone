import type { PreviewMedia } from "@/lib/preview-media";
import type { StudioRecipeSettings } from "@/lib/studio-recipe";

export type EffectPreset = {
  id: string;
  name: string;
  tagline: string;
  prompt: string;
  still: PreviewMedia;
  settings: StudioRecipeSettings;
};
