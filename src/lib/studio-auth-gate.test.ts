import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isSafeStudioReturnPath,
  loginHrefForReturnTo,
  normalizeStudioReturnPath,
  shouldShowStudioApiKeyPanel,
  shouldShowStudioApiKeyPanelLoading,
} from "@/lib/studio-auth-gate";

describe("studio-auth-gate", () => {
  it("normalizes unsafe return paths to /library", () => {
    assert.equal(normalizeStudioReturnPath("//evil"), "/library");
    assert.equal(normalizeStudioReturnPath("/login"), "/library");
    assert.equal(normalizeStudioReturnPath("/image?run=1"), "/image?run=1");
  });

  it("rejects open redirects in isSafeStudioReturnPath", () => {
    assert.equal(isSafeStudioReturnPath("/video"), true);
    assert.equal(isSafeStudioReturnPath("https://evil"), false);
    assert.equal(isSafeStudioReturnPath("/login?x=1"), false);
  });

  it("allows password reset as auth callback target", () => {
    assert.equal(isSafeStudioReturnPath("/login/reset-password"), true);
    assert.equal(
      normalizeStudioReturnPath("/login/reset-password"),
      "/login/reset-password",
    );
  });

  it("builds login href with redirect query", () => {
    assert.equal(
      loginHrefForReturnTo("/video?run=1"),
      "/login?redirect=%2Fvideo%3Frun%3D1",
    );
  });

  it("gates API key panel on sign-in when Supabase is required", () => {
    assert.equal(
      shouldShowStudioApiKeyPanel({
        signInRequired: true,
        user: null,
        authLoading: false,
      }),
      false,
    );
    assert.equal(
      shouldShowStudioApiKeyPanel({
        signInRequired: true,
        user: { id: "u1" },
        authLoading: false,
      }),
      true,
    );
    assert.equal(
      shouldShowStudioApiKeyPanel({
        signInRequired: false,
        user: null,
        authLoading: false,
      }),
      true,
    );
    assert.equal(
      shouldShowStudioApiKeyPanelLoading({
        signInRequired: true,
        user: null,
        authLoading: true,
      }),
      true,
    );
  });
});
