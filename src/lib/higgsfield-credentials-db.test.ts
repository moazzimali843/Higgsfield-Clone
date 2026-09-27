import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseHiggsfieldCredentialsBody } from "@/lib/higgsfield-credentials-db";

describe("higgsfield-credentials-db", () => {
  it("parses valid credential bodies", () => {
    const parsed = parseHiggsfieldCredentialsBody({
      credentials: "kid:secret",
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.value.keyId, "kid");
      assert.equal(parsed.value.keySecret, "secret");
    }
  });

  it("rejects invalid credential bodies", () => {
    assert.equal(parseHiggsfieldCredentialsBody(null).ok, false);
    assert.equal(parseHiggsfieldCredentialsBody({ credentials: "nocolon" }).ok, false);
  });
});
