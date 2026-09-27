import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCreateHref, isCreatePromptValid } from "@/lib/create-box-navigation";

describe("create box navigation", () => {
  it("rejects empty or whitespace prompts", () => {
    assert.equal(isCreatePromptValid(""), false);
    assert.equal(isCreatePromptValid("   "), false);
    assert.equal(buildCreateHref({ mode: "image", prompt: "  " }), null);
  });

  it("builds image href with encoded prompt and valid model", () => {
    const href = buildCreateHref({
      mode: "image",
      prompt: "a cat in space",
      modelId: "demo",
      aspectRatio: "16:9",
    });
    assert.equal(href, "/image?prompt=a+cat+in+space&aspectRatio=16%3A9&modelId=demo");
  });

  it("omits invalid image model and aspect ratio", () => {
    const href = buildCreateHref({
      mode: "image",
      prompt: "hello",
      modelId: "seedance-2.5",
      aspectRatio: "99:99",
    });
    assert.equal(href, "/image?prompt=hello");
  });

  it("builds video href and rejects soul model on video", () => {
    const valid = buildCreateHref({
      mode: "video",
      prompt: "ocean waves",
      modelId: "seedance-2.5",
    });
    assert.equal(valid, "/video?prompt=ocean+waves&modelId=seedance-2.5");

    const invalid = buildCreateHref({
      mode: "video",
      prompt: "ocean waves",
      modelId: "soul-v2-standard",
    });
    assert.equal(invalid, "/video?prompt=ocean+waves");
  });

  it("never emits remix or preset params", () => {
    const href = buildCreateHref({
      mode: "image",
      prompt: "test",
      modelId: "demo",
    });
    assert.ok(href);
    assert.doesNotMatch(href!, /remix=/);
    assert.doesNotMatch(href!, /preset=/);
  });

  it("adds run=1 when autorun is set for image navigation", () => {
    const href = buildCreateHref({
      mode: "image",
      prompt: "sunset",
      autorun: true,
    });
    assert.equal(href, "/image?prompt=sunset&run=1");
  });
});
