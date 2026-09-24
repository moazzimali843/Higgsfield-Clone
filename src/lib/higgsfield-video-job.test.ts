import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  firstVideoUrl,
  isAllowedHiggsfieldStatusUrl,
} from "@/lib/higgsfield-client";
import { mapHiggsfieldStatusToVideoJob } from "@/lib/higgsfield-video-job";
import {
  getVideoComposerModelById,
  isSeedanceVideoModelId,
} from "@/lib/studio-recipe";

describe("higgsfield video job", () => {
  it("maps completed jobs to higgsfield source with video URL", () => {
    const mapped = mapHiggsfieldStatusToVideoJob(
      {
        status: "completed",
        request_id: "req-1",
        status_url: "https://platform.higgsfield.ai/requests/req-1/status",
        video: { url: "https://cdn.example.com/out.mp4" },
      },
      { prompt: "A sunset", aspectRatio: "16:9" },
    );
    if (!("source" in mapped)) {
      assert.fail("expected terminal video job");
    }
    assert.equal(mapped.source, "higgsfield");
    assert.equal(mapped.outputUrl, "https://cdn.example.com/out.mp4");
  });

  it("reads firstVideoUrl from status payload", () => {
    assert.equal(
      firstVideoUrl({
        status: "completed",
        request_id: "x",
        status_url: "https://api.higgsfield.ai/requests/x",
        video: { url: "https://cdn.example.com/v.mp4" },
      }),
      "https://cdn.example.com/v.mp4",
    );
    assert.equal(
      firstVideoUrl({
        status: "completed",
        request_id: "x",
        status_url: "https://api.higgsfield.ai/requests/x",
      }),
      null,
    );
  });

  it("allows platform and api status hosts", () => {
    assert.equal(
      isAllowedHiggsfieldStatusUrl(
        "https://platform.higgsfield.ai/requests/abc/status",
      ),
      true,
    );
  });

  it("recognizes Seedance model ids including legacy alias", () => {
    assert.equal(isSeedanceVideoModelId("seedance-2.5"), true);
    assert.equal(isSeedanceVideoModelId("seedance-display"), true);
    assert.equal(isSeedanceVideoModelId("demo"), false);
    assert.equal(
      getVideoComposerModelById("seedance-display")?.label,
      "Seedance 2.5",
    );
  });
});
