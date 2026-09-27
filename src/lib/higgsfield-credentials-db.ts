import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatHiggsfieldCredentialsString,
  parseHiggsfieldCredentialsString,
  type HiggsfieldCredentials,
} from "@/lib/higgsfield-client";

export function parseHiggsfieldCredentialsBody(
  body: unknown,
): { ok: true; value: HiggsfieldCredentials } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const record = body as { credentials?: unknown; apiCredentials?: unknown };
  const raw =
    typeof record.credentials === "string"
      ? record.credentials
      : typeof record.apiCredentials === "string"
        ? record.apiCredentials
        : "";
  const parsed = parseHiggsfieldCredentialsString(raw);
  if (!parsed) {
    return {
      ok: false,
      error:
        "Paste credentials as key-id:key-secret (from open.higgsfield.ai/api-keys).",
    };
  }
  return { ok: true, value: parsed };
}

export async function getHiggsfieldCredentialsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<HiggsfieldCredentials | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("higgsfield_key_id, higgsfield_key_secret")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data?.higgsfield_key_id || !data?.higgsfield_key_secret) {
    return null;
  }
  const parsed = parseHiggsfieldCredentialsString(
    formatHiggsfieldCredentialsString({
      keyId: data.higgsfield_key_id,
      keySecret: data.higgsfield_key_secret,
    }),
  );
  return parsed;
}

export async function saveHiggsfieldCredentialsForUser(
  supabase: SupabaseClient,
  userId: string,
  creds: HiggsfieldCredentials,
): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      higgsfield_key_id: creds.keyId.trim(),
      higgsfield_key_secret: creds.keySecret.trim(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

export async function deleteHiggsfieldCredentialsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      higgsfield_key_id: null,
      higgsfield_key_secret: null,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}
