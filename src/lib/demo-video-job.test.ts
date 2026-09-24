import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseDemoVideoJobRequest,
  pickDemoVideoOutputUrl,
  runDemoVideoJob,
} from "@/lib/demo-video-job";

describe("demo video job", () => {
  it("picks a stable clip for the same prompt", () => {
    const a = pickDemoVideoOutputUrl("city at dusk", "16:9");
    const b = pickDemoVideoOutputUrl("city at dusk", "16:9");
    assert.equal(a, b);
    assert.match(a, /^https:\/\/videos\.pexels\.com\//);
  });

  it("rejects empty prompts", () => {
    const result = parseDemoVideoJobRequest({ prompt: "  ", aspectRatio: "16:9" });
    assert.equal(result.ok, false);
  });

  it("returns demo fallback flag for non-demo models", () => {
    const parsed = parseDemoVideoJobRequest({
      prompt: "test",
      aspectRatio: "16:9",
      modelId: "seedance-display",
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const job = runDemoVideoJob(parsed.value);
    assert.equal(job.source, "demo");
    assert.equal(job.usedDemoFallbackForModel, true);
  });
});
