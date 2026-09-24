import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSoulV2StandardBody,
  isHiggsfieldAuthOrAvailabilityError,
  isTerminalHiggsfieldStatus,
  resolveHiggsfieldCredentials,
} from "@/lib/higgsfield-client";

describe("higgsfield client helpers", () => {
  it("resolves credentials from input or env", () => {
    const fromInput = resolveHiggsfieldCredentials(
      { apiKeyId: " id ", apiKeySecret: " secret " },
      {},
    );
    assert.deepEqual(fromInput, { keyId: "id", keySecret: "secret" });

    const fromEnv = resolveHiggsfieldCredentials(
      {},
      { HIGGSFIELD_KEY_ID: "env-id", HIGGSFIELD_KEY_SECRET: "env-secret" },
    );
    assert.deepEqual(fromEnv, { keyId: "env-id", keySecret: "env-secret" });

    assert.equal(resolveHiggsfieldCredentials({}, {}), null);
  });

  it("builds Soul v2 body with optional reference URL", () => {
    const base = buildSoulV2StandardBody("hello", "16:9");
    assert.equal(base.prompt, "hello");
    assert.equal(base.aspect_ratio, "16:9");
    assert.equal(base.image_url, undefined);

    const withRef = buildSoulV2StandardBody("hello", "1:1", {
      imageUrl: "https://cdn.example.com/ref.jpg",
    });
    assert.equal(withRef.image_url, "https://cdn.example.com/ref.jpg");
  });

  it("classifies terminal statuses and availability errors", () => {
    assert.equal(isTerminalHiggsfieldStatus("completed"), true);
    assert.equal(isTerminalHiggsfieldStatus("queued"), false);
    assert.equal(isHiggsfieldAuthOrAvailabilityError(401), true);
    assert.equal(isHiggsfieldAuthOrAvailabilityError(500), false);
  });
});
