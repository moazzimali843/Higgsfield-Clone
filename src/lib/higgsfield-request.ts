import { parseExcludeOutputUrls } from "@/lib/demo-image-job";
import {
  aspectRatioOptions,
  type AspectRatio,
} from "@/lib/studio-recipe";

const PROMPT_MAX_LENGTH = 4_000;

export type SoulImageJobFields = {
  prompt: string;
  aspectRatio: AspectRatio;
  apiKeyId?: string;
  apiKeySecret?: string;
};

export function parseSoulImageJobFields(
  record: Record<string, unknown>,
): { ok: true; value: SoulImageJobFields } | { ok: false; error: string } {
  const prompt =
    typeof record.prompt === "string" ? record.prompt.trim() : "";
  if (!prompt) {
    return { ok: false, error: "Prompt is required." };
  }
  if (prompt.length > PROMPT_MAX_LENGTH) {
    return {
      ok: false,
      error: `Prompt must be at most ${PROMPT_MAX_LENGTH} characters.`,
    };
  }

  const aspectRatio = record.aspectRatio;
  if (
    typeof aspectRatio !== "string" ||
    !aspectRatioOptions.includes(aspectRatio as AspectRatio)
  ) {
    return { ok: false, error: "Invalid aspect ratio." };
  }

  const apiKeyId =
    typeof record.apiKeyId === "string" ? record.apiKeyId.trim() : undefined;
  const apiKeySecret =
    typeof record.apiKeySecret === "string"
      ? record.apiKeySecret.trim()
      : undefined;

  return {
    ok: true,
    value: {
      prompt,
      aspectRatio: aspectRatio as AspectRatio,
      apiKeyId,
      apiKeySecret,
    },
  };
}

export function parseSoulImageJobJson(
  body: unknown,
): { ok: true; value: SoulImageJobFields } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  return parseSoulImageJobFields(body as Record<string, unknown>);
}

const REFERENCE_ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function referenceContentTypeFromFile(
  file: File,
): string | null {
  if (REFERENCE_ACCEPTED.has(file.type)) return file.type;
  return null;
}

export type SoulImagePollFields = SoulImageJobFields & {
  statusUrl: string;
  excludeOutputUrls?: string[];
  usedReferenceUpload?: boolean;
  clientTimedOut?: boolean;
};

export function parseSoulImagePollJson(
  body: unknown,
): { ok: true; value: SoulImagePollFields } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const record = body as Record<string, unknown>;
  const base = parseSoulImageJobFields(record);
  if (!base.ok) return base;

  const statusUrl =
    typeof record.statusUrl === "string" ? record.statusUrl.trim() : "";
  if (!statusUrl) {
    return { ok: false, error: "statusUrl is required." };
  }

  const excludeOutputUrls = parseExcludeOutputUrls(record.excludeOutputUrls);
  const usedReferenceUpload = record.usedReferenceUpload === true;
  const clientTimedOut = record.clientTimedOut === true;

  return {
    ok: true,
    value: {
      ...base.value,
      statusUrl,
      excludeOutputUrls,
      usedReferenceUpload,
      clientTimedOut,
    },
  };
}

export type SeedanceVideoPollFields = SoulImageJobFields & {
  statusUrl: string;
  clientTimedOut?: boolean;
};

/** Same shape as Soul poll JSON without reference upload fields. */
export function parseSeedanceVideoPollJson(
  body: unknown,
): { ok: true; value: SeedanceVideoPollFields } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const record = body as Record<string, unknown>;
  const base = parseSoulImageJobFields(record);
  if (!base.ok) return base;

  const statusUrl =
    typeof record.statusUrl === "string" ? record.statusUrl.trim() : "";
  if (!statusUrl) {
    return { ok: false, error: "statusUrl is required." };
  }

  const clientTimedOut = record.clientTimedOut === true;

  return {
    ok: true,
    value: {
      ...base.value,
      statusUrl,
      clientTimedOut,
    },
  };
}

export function parseExcludeOutputUrlsField(
  value: FormDataEntryValue | null,
): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    return parseExcludeOutputUrls(JSON.parse(value) as unknown);
  } catch {
    return [];
  }
}
