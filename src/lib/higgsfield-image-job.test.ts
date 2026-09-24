import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapHiggsfieldStatusToImageJob } from "@/lib/higgsfield-image-job";
import { isImageJobResponse } from "@/lib/generation-types";

describe("mapHiggsfieldStatusToImageJob", () => {
  it("returns in-progress polling state", () => {
    const mapped = mapHiggsfieldStatusToImageJob(
      {
        status: "in_progress",
        request_id: "req-1",
        status_url: "https://api.higgsfield.ai/requests/req-1",
      },
      { aspectRatio: "16:9" },
    );
    assert.equal("phase" in mapped && mapped.phase, "polling");
    if ("higgsfieldStatus" in mapped) {
      assert.equal(mapped.higgsfieldStatus, "in_progress");
      assert.equal(mapped.requestId, "req-1");
    }
  });

  it("maps completed jobs to higgsfield source", () => {
    const mapped = mapHiggsfieldStatusToImageJob(
      {
        status: "completed",
        request_id: "req-2",
        status_url: "https://api.higgsfield.ai/requests/req-2",
        images: [{ url: "https://cdn.example.com/out.jpg" }],
      },
      { aspectRatio: "1:1", usedReferenceUpload: true },
    );
    assert.equal(isImageJobResponse(mapped), true);
    if (isImageJobResponse(mapped) && mapped.source === "higgsfield") {
      assert.equal(mapped.outputUrl, "https://cdn.example.com/out.jpg");
      assert.equal(mapped.usedReferenceUpload, true);
    }
  });

  it("demo-fallback on failed terminal status", () => {
    const mapped = mapHiggsfieldStatusToImageJob(
      {
        status: "failed",
        request_id: "req-3",
        status_url: "https://api.higgsfield.ai/requests/req-3",
      },
      { aspectRatio: "9:16" },
    );
    assert.equal(isImageJobResponse(mapped), true);
    if (isImageJobResponse(mapped) && mapped.source === "demo") {
      assert.equal(mapped.usedDemoFallbackForModel, true);
    }
  });
});
