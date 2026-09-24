import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseSoulImageJobJson,
  parseSoulImagePollJson,
} from "@/lib/higgsfield-request";

describe("higgsfield request parsing", () => {
  it("parses valid Soul job JSON", () => {
    const parsed = parseSoulImageJobJson({
      prompt: "  alpine lake ",
      aspectRatio: "16:9",
      apiKeyId: "kid",
      apiKeySecret: "sec",
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.value.prompt, "alpine lake");
      assert.equal(parsed.value.aspectRatio, "16:9");
      assert.equal(parsed.value.apiKeyId, "kid");
    }
  });

  it("rejects missing prompt", () => {
    const parsed = parseSoulImageJobJson({ aspectRatio: "1:1" });
    assert.equal(parsed.ok, false);
  });

  it("parses Soul poll JSON", () => {
    const parsed = parseSoulImagePollJson({
      prompt: "test",
      aspectRatio: "16:9",
      statusUrl: "https://api.higgsfield.ai/requests/abc",
      apiKeyId: "kid",
      apiKeySecret: "sec",
      clientTimedOut: true,
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.value.statusUrl, "https://api.higgsfield.ai/requests/abc");
      assert.equal(parsed.value.clientTimedOut, true);
    }
  });
});
