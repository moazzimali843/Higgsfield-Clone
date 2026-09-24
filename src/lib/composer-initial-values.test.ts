import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composerHrefForPreset } from "@/data/effect-presets";
import { resolveComposerFromPresetParam } from "@/lib/composer-initial-values";
import { firstQueryValue } from "@/lib/search-params";

describe("effect preset handoff", () => {
  it("builds composer URLs with encoded ids", () => {
    assert.equal(
      composerHrefForPreset("neon-drift"),
      "/image?preset=neon-drift",
    );
    assert.equal(
      composerHrefForPreset("needs encode"),
      "/image?preset=needs%20encode",
    );
  });

  it("fills composer from a known preset", () => {
    const state = resolveComposerFromPresetParam("floating-fall");
    assert.equal(state.presetName, "Floating Fall");
    assert.match(state.initialValues.prompt, /mid-air/i);
    assert.equal(state.initialValues.aspectRatio, "9:16");
    assert.equal(state.initialValues.modelId, "demo");
  });

  it("falls back when preset is missing", () => {
    const state = resolveComposerFromPresetParam("not-a-real-preset");
    assert.equal(state.presetName, undefined);
    assert.equal(state.unknownPresetId, "not-a-real-preset");
    assert.equal(state.initialValues.prompt, "");
    assert.equal(state.initialValues.aspectRatio, "1:1");
  });

  it("uses blank composer when param is empty", () => {
    const state = resolveComposerFromPresetParam(undefined);
    assert.equal(state.presetName, undefined);
    assert.equal(state.initialValues.prompt, "");
  });

  it("normalizes query values (trim, arrays, empty)", () => {
    assert.equal(firstQueryValue(undefined), undefined);
    assert.equal(firstQueryValue("   "), undefined);
    assert.equal(firstQueryValue(" neon-drift "), "neon-drift");
    assert.equal(firstQueryValue(["floating-fall", "ignored"]), "floating-fall");
    assert.equal(firstQueryValue([]), undefined);
  });
});
