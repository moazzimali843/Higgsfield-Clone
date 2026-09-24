import type { GenerationRecipe } from "@/lib/generation-types";
import { aspectRatioOptions, getComposerModelById } from "@/lib/studio-recipe";

export function imageComposerHrefFromRecipe(recipe: GenerationRecipe): string {
  const params = new URLSearchParams();
  params.set("prompt", recipe.prompt);
  if (aspectRatioOptions.includes(recipe.aspectRatio)) {
    params.set("aspectRatio", recipe.aspectRatio);
  }
  const model = getComposerModelById(recipe.modelId);
  if (model) {
    params.set("modelId", recipe.modelId);
  }
  if (recipe.effectPresetId) {
    params.set("preset", recipe.effectPresetId);
  }
  return `/image?${params.toString()}`;
}
