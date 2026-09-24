import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LibraryGeneration } from "@/lib/generation-types";
import {
  LIBRARY_MAX_ITEMS,
  parseLibraryJson,
  prependGeneration,
} from "@/lib/studio-library";

const sample: LibraryGeneration = {
  id: "gen-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  source: "demo" as const,
  mediaType: "image",
  outputUrl: "https://images.pexels.com/photos/1/pexels-photo-1.jpeg",
  recipe: {
    prompt: "hello",
    aspectRatio: "1:1",
    modelId: "demo",
  },
};

describe("studio library storage helpers", () => {
  it("parses valid JSON and drops invalid rows", () => {
    const items = parseLibraryJson(
      JSON.stringify([sample, { id: "bad" }, null]),
    );
    assert.equal(items.length, 1);
    assert.equal(items[0]?.id, "gen-1");
  });

  it("keeps real Higgsfield generations", () => {
    const real: LibraryGeneration = {
      ...sample,
      id: "real-1",
      source: "higgsfield",
      outputUrl: "https://cdn.example.com/out.jpg",
      recipe: { ...sample.recipe, modelId: "soul-v2-standard" },
    };
    const items = parseLibraryJson(JSON.stringify([real]));
    assert.equal(items.length, 1);
    assert.equal(items[0]?.source, "higgsfield");
  });

  it("accepts video generations", () => {
    const video: LibraryGeneration = {
      ...sample,
      id: "vid-1",
      mediaType: "video",
      outputUrl:
        "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4",
    };
    const items = parseLibraryJson(JSON.stringify([video]));
    assert.equal(items.length, 1);
    assert.equal(items[0]?.mediaType, "video");
  });

  it("keeps phase 4 image rows after video support", () => {
    const legacy = { ...sample, mediaType: "image" as const };
    const items = parseLibraryJson(JSON.stringify([legacy]));
    assert.equal(items.length, 1);
    assert.equal(items[0]?.mediaType, "image");
  });

  it("prepends and caps list length", () => {
    const many = Array.from({ length: LIBRARY_MAX_ITEMS }, (_, i) => ({
      ...sample,
      id: `id-${i}`,
    }));
    const next = prependGeneration(many, { ...sample, id: "new" });
    assert.equal(next.length, LIBRARY_MAX_ITEMS);
    assert.equal(next[0]?.id, "new");
  });
});
