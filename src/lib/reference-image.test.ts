import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  REFERENCE_IMAGE_MAX_BYTES,
  validateReferenceImageFile,
} from "@/lib/reference-image";

describe("reference image validation", () => {
  it("rejects files over the Vercel-safe limit", () => {
    const tooLarge = new File(
      [new Uint8Array(REFERENCE_IMAGE_MAX_BYTES + 1)],
      "big.jpg",
      { type: "image/jpeg" },
    );
    const result = validateReferenceImageFile(tooLarge);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /4 MB/);
    }
  });

  it("accepts a small JPEG", () => {
    const ok = new File([new Uint8Array(1024)], "ok.jpg", {
      type: "image/jpeg",
    });
    assert.equal(validateReferenceImageFile(ok).ok, true);
  });
});
