import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSoulV2StandardBody,
  firstVideoUrl,
  higgsfieldErrorMessageFromPayload,
  isAllowedHiggsfieldStatusUrl,
  isHiggsfieldAuthOrAvailabilityError,
  isHiggsfieldInsufficientCreditsError,
  isHiggsfieldModelAvailabilityError,
  isTerminalHiggsfieldStatus,
  mapHiggsfieldUpstreamJobError,
  parseHiggsfieldCredentialsString,
  resolveHiggsfieldCredentials,
} from "@/lib/higgsfield-client";

describe("higgsfield client helpers", () => {
  it("parses combined credential strings", () => {
    assert.deepEqual(
      parseHiggsfieldCredentialsString("  key-id : secret-part "),
      { keyId: "key-id", keySecret: "secret-part" },
    );
    assert.equal(parseHiggsfieldCredentialsString("no-colon"), null);
    assert.equal(parseHiggsfieldCredentialsString(":secret"), null);
  });

  it("resolves credentials from input or env", () => {
    const fromInput = resolveHiggsfieldCredentials(
      { apiKeyId: " id ", apiKeySecret: " secret " },
      {},
    );
    assert.deepEqual(fromInput, { keyId: "id", keySecret: "secret" });

    const fromCombined = resolveHiggsfieldCredentials(
      { apiCredentials: "combo-id:combo-secret" },
      {},
    );
    assert.deepEqual(fromCombined, {
      keyId: "combo-id",
      keySecret: "combo-secret",
    });

    const fromEnv = resolveHiggsfieldCredentials(
      {},
      { HIGGSFIELD_KEY_ID: "env-id", HIGGSFIELD_KEY_SECRET: "env-secret" },
    );
    assert.deepEqual(fromEnv, { keyId: "env-id", keySecret: "env-secret" });

    const fromEnvCombined = resolveHiggsfieldCredentials(
      {},
      { HIGGSFIELD_CREDENTIALS: "env-combo:env-secret" },
    );
    assert.deepEqual(fromEnvCombined, {
      keyId: "env-combo",
      keySecret: "env-secret",
    });

    assert.equal(resolveHiggsfieldCredentials({}, {}), null);

    assert.equal(
      resolveHiggsfieldCredentials(
        { apiKeyId: "ui-only" },
        { HIGGSFIELD_KEY_SECRET: "env-secret" },
      ),
      null,
    );
  });

  it("allows only Higgsfield status URLs", () => {
    assert.equal(
      isAllowedHiggsfieldStatusUrl(
        "https://api.higgsfield.ai/requests/abc",
      ),
      true,
    );
    assert.equal(
      isAllowedHiggsfieldStatusUrl(
        "https://platform.higgsfield.ai/requests/abc/status",
      ),
      true,
    );
    assert.equal(
      isAllowedHiggsfieldStatusUrl("https://evil.example/requests/abc"),
      false,
    );
    assert.equal(isAllowedHiggsfieldStatusUrl("not-a-url"), false);
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
    assert.equal(isHiggsfieldModelAvailabilityError(404), true);
    assert.equal(isHiggsfieldModelAvailabilityError(401), false);
    assert.equal(isHiggsfieldAuthOrAvailabilityError(500), false);
  });

  it("reads API error payloads including detail", () => {
    assert.equal(
      higgsfieldErrorMessageFromPayload({ detail: "Invalid credentials" }),
      "Invalid credentials",
    );
    assert.equal(
      higgsfieldErrorMessageFromPayload({ error: "not_enough_credits" }),
      "not_enough_credits",
    );
  });

  it("maps insufficient-credits upstream errors to 402", () => {
    assert.equal(
      isHiggsfieldInsufficientCreditsError(403, "not_enough_credits"),
      true,
    );
    assert.equal(
      isHiggsfieldInsufficientCreditsError(401, "not_enough_credits"),
      true,
    );
    const mapped = mapHiggsfieldUpstreamJobError(403, "not_enough_credits");
    assert.equal(mapped.httpStatus, 402);
    assert.match(mapped.error, /enough credits/i);
  });

  it("extracts video URL from REST or SDK-shaped status payloads", () => {
    assert.equal(
      firstVideoUrl({
        status: "completed",
        request_id: "r1",
        status_url: "https://api.higgsfield.ai/requests/r1/status",
        video: { url: "https://cdn.example.com/a.mp4" },
      }),
      "https://cdn.example.com/a.mp4",
    );
    assert.equal(
      firstVideoUrl({
        status: "completed",
        request_id: "r2",
        status_url: "https://api.higgsfield.ai/requests/r2/status",
        jobs: [{ results: { raw: { url: "https://cdn.example.com/b.mp4" } } }],
      } as Parameters<typeof firstVideoUrl>[0]),
      "https://cdn.example.com/b.mp4",
    );
  });
});
