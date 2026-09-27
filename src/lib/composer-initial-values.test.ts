import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyVideoComposerRemixQuery,
  resolveComposerPageState,
} from "@/lib/composer-initial-values";
import { firstQueryValue } from "@/lib/search-params";

describe("composer initial values", () => {
  it("starts blank when no query params are present", () => {
    const state = resolveComposerPageState({});
    assert.equal(state.initialValues.prompt, "");
    assert.equal(state.initialValues.aspectRatio, "1:1");
    assert.equal(state.initialValues.modelId, "demo");
  });

  it("applies image page query with model validation", () => {
    const state = resolveComposerPageState({
      prompt: "  portrait  ",
      modelId: "demo",
      aspectRatio: "9:16",
    });
    assert.equal(state.initialValues.prompt, "  portrait  ");
    assert.equal(state.initialValues.modelId, "demo");
    assert.equal(state.initialValues.aspectRatio, "9:16");
  });

  it("normalizes query values (trim, arrays, empty)", () => {
    assert.equal(firstQueryValue(undefined), undefined);
    assert.equal(firstQueryValue("   "), undefined);
    assert.equal(firstQueryValue(" neon-drift "), "neon-drift");
    assert.equal(firstQueryValue(["floating-fall", "ignored"]), "floating-fall");
    assert.equal(firstQueryValue([]), undefined);
  });

  it("applies video page query with video model validation", () => {
    const base = applyVideoComposerRemixQuery(
      { prompt: "", aspectRatio: "16:9", modelId: "demo" },
      {
        prompt: "  waves  ",
        modelId: "soul-v2-standard",
        aspectRatio: "16:9",
      },
    );
    assert.equal(base.prompt, "  waves  ");
    assert.equal(base.modelId, "demo");
    assert.equal(base.aspectRatio, "16:9");

    const seedance = applyVideoComposerRemixQuery(
      { prompt: "", aspectRatio: "16:9", modelId: "demo" },
      { modelId: "seedance-2.5" },
    );
    assert.equal(seedance.modelId, "seedance-2.5");
  });
});
