import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSoulImageJobJson } from "@/lib/higgsfield-request";

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
});
