export type RemoteCredentialsResponse = {
  credentials: string | null;
};

export async function fetchRemoteHiggsfieldCredentials(): Promise<
  | { ok: true; credentials: string | null }
  | { ok: false; error: string }
> {
  const response = await fetch("/api/higgsfield/credentials", {
    method: "GET",
    credentials: "same-origin",
  });
  if (response.status === 401) {
    return { ok: true, credentials: null };
  }
  const payload = (await response.json()) as
    | RemoteCredentialsResponse
    | { error?: string };
  if (!response.ok) {
    return {
      ok: false,
      error:
        typeof payload === "object" && payload && "error" in payload
          ? String(payload.error ?? "Failed to load API key.")
          : "Failed to load API key.",
    };
  }
  const credentials =
    typeof payload === "object" &&
    payload &&
    "credentials" in payload &&
    (payload.credentials === null || typeof payload.credentials === "string")
      ? payload.credentials
      : null;
  return { ok: true, credentials };
}

export async function saveRemoteHiggsfieldCredentials(
  credentials: string,
): Promise<{ ok: true; credentials: string } | { ok: false; error: string }> {
  const response = await fetch("/api/higgsfield/credentials", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credentials }),
  });
  const payload = (await response.json()) as
    | RemoteCredentialsResponse
    | { error?: string };
  if (!response.ok) {
    return {
      ok: false,
      error:
        typeof payload === "object" && payload && "error" in payload
          ? String(payload.error ?? "Failed to save API key.")
          : "Failed to save API key.",
    };
  }
  const saved =
    typeof payload === "object" &&
    payload &&
    "credentials" in payload &&
    typeof payload.credentials === "string"
      ? payload.credentials
      : credentials;
  return { ok: true, credentials: saved };
}

export async function deleteRemoteHiggsfieldCredentials(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const response = await fetch("/api/higgsfield/credentials", {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    return {
      ok: false,
      error: payload.error ?? "Failed to delete API key.",
    };
  }
  return { ok: true };
}
