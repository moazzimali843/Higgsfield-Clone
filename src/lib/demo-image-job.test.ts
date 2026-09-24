import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseDemoImageJobRequest,
  pickDemoOutputUrl,
  runDemoImageJob,
} from "@/lib/demo-image-job";

describe("demo image job", () => {
  it("picks a random output for the aspect ratio", () => {
    const url = pickDemoOutputUrl("16:9", { random: () => 0 });
    assert.match(url, /^https:\/\/images\.pexels\.com\//);
  });

  it("avoids URLs already in the library when possible", () => {
    const first = pickDemoOutputUrl("1:1", { random: () => 0 });
    const second = pickDemoOutputUrl("1:1", {
      excludeUrls: [first],
      random: () => 0,
    });
    assert.notEqual(first, second);
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

  it("parses excludeOutputUrls from the request body", () => {
    const parsed = parseDemoImageJobRequest({
      prompt: "hello",
      aspectRatio: "1:1",
      excludeOutputUrls: ["https://images.pexels.com/photos/1/a.jpeg"],
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.value.excludeOutputUrls?.length, 1);
  });
});
