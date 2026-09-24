const SESSION_KEY = "studio-higgsfield-api-key-v1";

export type HiggsfieldApiKeySession = {
  keyId: string;
  keySecret: string;
};

export function readHiggsfieldApiKeySession():
  | { ok: true; value: HiggsfieldApiKeySession | null }
  | { ok: false; error: string } {
  if (typeof window === "undefined") {
    return { ok: true, value: null };
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { ok: true, value: null };
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as { keyId?: unknown }).keyId !== "string" ||
      typeof (parsed as { keySecret?: unknown }).keySecret !== "string"
    ) {
      return { ok: true, value: null };
    }
    const keyId = (parsed as { keyId: string }).keyId.trim();
    const keySecret = (parsed as { keySecret: string }).keySecret.trim();
    if (!keyId || !keySecret) return { ok: true, value: null };
    return { ok: true, value: { keyId, keySecret } };
  } catch {
    return {
      ok: false,
      error: "Browser storage is unavailable. Paste keys in the composer or use server env vars.",
    };
  }
}

export function writeHiggsfieldApiKeySession(
  value: HiggsfieldApiKeySession,
): { ok: true } | { ok: false; error: string } {
  if (typeof window === "undefined") {
    return { ok: false, error: "Cannot save keys during server render." };
  }
  try {
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        keyId: value.keyId.trim(),
        keySecret: value.keySecret.trim(),
      }),
    );
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Could not save keys in this browser session.",
    };
  }
}

export function clearHiggsfieldApiKeySession(): { ok: true } | { ok: false; error: string } {
  if (typeof window === "undefined") {
    return { ok: true };
  }
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not clear saved keys." };
  }
}
