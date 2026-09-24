import type { GenerationRecipe, LibraryGeneration } from "@/lib/generation-types";
import {
  getComposerModelById,
  type ImageComposerInitialValues,
} from "@/lib/studio-recipe";

export function composerHrefForRemix(generationId: string): string {
  return `/image?remix=${encodeURIComponent(generationId)}`;
}

export function libraryHrefForGeneration(generationId: string): string {
  return `/library/${encodeURIComponent(generationId)}`;
}

export function findLibraryGenerationById(
  items: LibraryGeneration[],
  id: string,
): LibraryGeneration | undefined {
  return items.find((item) => item.id === id);
}

export function recipeToComposerInitialValues(
  recipe: GenerationRecipe,
): ImageComposerInitialValues {
  const modelId =
    getComposerModelById(recipe.modelId)?.id ?? recipe.modelId;

  return {
    prompt: recipe.prompt,
    aspectRatio: recipe.aspectRatio,
    modelId,
  };
}
