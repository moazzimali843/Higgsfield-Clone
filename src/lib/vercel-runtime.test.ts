import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { higgsfieldClientPollMaxWaitMs } from "@/lib/vercel-runtime";

describe("vercel runtime helpers", () => {
  it("defaults client poll budget to 120s", () => {
    assert.equal(higgsfieldClientPollMaxWaitMs({}), 120_000);
  });

  it("honors HIGGSFIELD_CLIENT_POLL_MAX_WAIT_MS", () => {
    assert.equal(
      higgsfieldClientPollMaxWaitMs({
        HIGGSFIELD_CLIENT_POLL_MAX_WAIT_MS: "90000",
      }),
      90_000,
    );
  });

  it("falls back to legacy HIGGSFIELD_POLL_MAX_WAIT_MS", () => {
    assert.equal(
      higgsfieldClientPollMaxWaitMs({
        HIGGSFIELD_POLL_MAX_WAIT_MS: "60000",
      }),
      60_000,
    );
  });
});
