import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  composerHrefForRemix,
  findLibraryGenerationById,
  libraryHrefForGeneration,
  recipeToComposerInitialValues,
} from "@/lib/composer-remix";
import type { LibraryGeneration } from "@/lib/generation-types";

const sample: LibraryGeneration = {
  id: "gen-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  source: "demo",
  mediaType: "image",
  outputUrl: "https://example.com/out.jpg",
  recipe: {
    prompt: "A neon portrait",
    aspectRatio: "9:16",
    modelId: "demo",
    effectPresetId: "neon-drift",
    referenceFileName: "ref.png",
  },
};

describe("composer remix helpers", () => {
  it("builds remix and library detail URLs", () => {
    assert.equal(composerHrefForRemix("abc-123"), "/image?remix=abc-123");
    assert.equal(
      composerHrefForRemix("needs encode"),
      "/image?remix=needs%20encode",
    );
    assert.equal(
      libraryHrefForGeneration("abc-123"),
      "/library/abc-123",
    );
  });

  it("finds a generation by id", () => {
    assert.equal(findLibraryGenerationById([sample], "gen-1"), sample);
    assert.equal(findLibraryGenerationById([sample], "missing"), undefined);
  });

  it("maps a stored recipe into composer initial values", () => {
    const values = recipeToComposerInitialValues(sample.recipe);
    assert.equal(values.prompt, "A neon portrait");
    assert.equal(values.aspectRatio, "9:16");
    assert.equal(values.modelId, "demo");
  });

  it("keeps unknown model ids for forward compatibility", () => {
    const values = recipeToComposerInitialValues({
      ...sample.recipe,
      modelId: "future-model",
    });
    assert.equal(values.modelId, "future-model");
  });
});
