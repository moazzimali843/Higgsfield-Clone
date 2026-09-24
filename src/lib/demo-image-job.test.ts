import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseDemoImageJobRequest,
  pickDemoOutputUrl,
  runDemoImageJob,
} from "@/lib/demo-image-job";

describe("demo image job", () => {
  it("picks a stable output for the same prompt", () => {
    const a = pickDemoOutputUrl("neon portrait", "16:9");
    const b = pickDemoOutputUrl("neon portrait", "16:9");
    assert.equal(a, b);
    assert.match(a, /^https:\/\/images\.pexels\.com\//);
  });

  it("rejects empty prompts", () => {
    const result = parseDemoImageJobRequest({ prompt: "  ", aspectRatio: "1:1" });
    assert.equal(result.ok, false);
  });

  it("returns demo fallback flag for non-demo models", () => {
    const parsed = parseDemoImageJobRequest({
      prompt: "test",
      aspectRatio: "1:1",
      modelId: "soul-v2-standard",
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const job = runDemoImageJob(parsed.value);
    assert.equal(job.source, "demo");
    assert.equal(job.usedDemoFallbackForModel, true);
  });
});
