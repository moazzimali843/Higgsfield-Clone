import type { AspectRatio } from "@/lib/studio-recipe";

export const HIGGSFIELD_API_BASE = "https://api.higgsfield.ai";
export const SOUL_V2_STANDARD_MODEL_PATH = "higgsfield-ai/soul/v2/standard";
export const SEEDANCE_TEXT_TO_VIDEO_MODEL_PATH =
  "bytedance/seedance-2.5/text-to-video";

const ALLOWED_HIGGSFIELD_STATUS_HOSTS = new Set([
  "api.higgsfield.ai",
  "platform.higgsfield.ai",
]);

export const OUTPUT_RETENTION_NOTE =
  "Higgsfield hosts this file for at least 7 days. Download it if you need a permanent copy.";

export type HiggsfieldCredentials = {
  keyId: string;
  keySecret: string;
};

export type HiggsfieldEnv = {
  HIGGSFIELD_KEY_ID?: string;
  HIGGSFIELD_KEY_SECRET?: string;
  /** `key-id:key-secret` — matches HF_CREDENTIALS / HF_KEY in official SDKs */
  HIGGSFIELD_CREDENTIALS?: string;
};

/** Server env vars for API routes (Next.js `process.env`). */
export function readHiggsfieldServerEnv(): HiggsfieldEnv {
  return {
    HIGGSFIELD_KEY_ID: process.env.HIGGSFIELD_KEY_ID,
    HIGGSFIELD_KEY_SECRET: process.env.HIGGSFIELD_KEY_SECRET,
    HIGGSFIELD_CREDENTIALS:
      process.env.HIGGSFIELD_CREDENTIALS ?? process.env.HF_CREDENTIALS,
  };
}

/**
 * Parse credentials copied from Higgsfield Console / open.higgsfield.ai/api-keys.
 * Format: `your-api-key-id:your-api-key-secret`
 */
export function parseHiggsfieldCredentialsString(
  raw: string,
): HiggsfieldCredentials | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const colon = trimmed.indexOf(":");
  if (colon <= 0 || colon >= trimmed.length - 1) return null;
  const keyId = trimmed.slice(0, colon).trim();
  const keySecret = trimmed.slice(colon + 1).trim();
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export function formatHiggsfieldCredentialsString(
  creds: HiggsfieldCredentials,
): string {
  return `${creds.keyId}:${creds.keySecret}`;
}

export type HiggsfieldTerminalStatus =
  | "completed"
  | "failed"
  | "nsfw"
  | "canceled";

export type HiggsfieldNonTerminalStatus = "queued" | "in_progress";

export type HiggsfieldRequestStatus = HiggsfieldTerminalStatus | HiggsfieldNonTerminalStatus;

export type HiggsfieldSubmitResponse = {
  status: HiggsfieldRequestStatus;
  request_id: string;
  status_url: string;
  cancel_url?: string;
};

export type HiggsfieldStatusResponse = HiggsfieldSubmitResponse & {
  images?: Array<{ url: string }>;
  video?: { url: string };
};

export type HiggsfieldEstimateResponse = {
  credits: string;
  usd: string;
};

export type HiggsfieldUploadUrlResponse = {
  public_url: string;
  upload_url: string;
  content_type: string;
  upload_headers: Record<string, string>;
};

export function resolveHiggsfieldCredentials(
  input: {
    apiKeyId?: string;
    apiKeySecret?: string;
    apiCredentials?: string;
  },
  env: HiggsfieldEnv,
): HiggsfieldCredentials | null {
  const fromCombined =
    input.apiCredentials?.trim() &&
    parseHiggsfieldCredentialsString(input.apiCredentials);
  if (fromCombined) return fromCombined;

  const uiKeyId = input.apiKeyId?.trim();
  const uiKeySecret = input.apiKeySecret?.trim();

  if (uiKeyId || uiKeySecret) {
    if (!uiKeyId || !uiKeySecret) return null;
    return { keyId: uiKeyId, keySecret: uiKeySecret };
  }

  const envCombined = env.HIGGSFIELD_CREDENTIALS?.trim();
  if (envCombined) {
    const parsed = parseHiggsfieldCredentialsString(envCombined);
    if (parsed) return parsed;
  }

  const keyId = env.HIGGSFIELD_KEY_ID?.trim();
  const keySecret = env.HIGGSFIELD_KEY_SECRET?.trim();
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

/** Only poll status URLs returned by Higgsfield (SSRF hygiene). */
export function isAllowedHiggsfieldStatusUrl(statusUrl: string): boolean {
  try {
    const parsed = new URL(statusUrl);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_HIGGSFIELD_STATUS_HOSTS.has(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function higgsfieldAuthHeader(creds: HiggsfieldCredentials): string {
  return `Key ${creds.keyId}:${creds.keySecret}`;
}

export function buildSoulV2StandardBody(
  prompt: string,
  aspectRatio: AspectRatio,
  options?: { imageUrl?: string },
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    prompt,
    aspect_ratio: aspectRatio,
    resolution: "720p",
    batch_size: 1,
    enhance_prompt: true,
  };
  if (options?.imageUrl) {
    body.image_url = options.imageUrl;
  }
  return body;
}

export function isTerminalHiggsfieldStatus(
  status: string,
): status is HiggsfieldTerminalStatus {
  return (
    status === "completed" ||
    status === "failed" ||
    status === "nsfw" ||
    status === "canceled"
  );
}

/** Model or account access issues — demo fallback is acceptable when the real API cannot run. */
export function isHiggsfieldModelAvailabilityError(status: number): boolean {
  return status === 404 || status === 423 || status === 503;
}

/** @deprecated Use isHiggsfieldModelAvailabilityError; 401 should surface to the user. */
export function isHiggsfieldAuthOrAvailabilityError(status: number): boolean {
  return status === 401 || isHiggsfieldModelAvailabilityError(status);
}

export const HIGGSFIELD_INSUFFICIENT_CREDITS_USER_MESSAGE =
  "Not enough credits for this job. Add credits to your account or switch to Demo.";

export function isHiggsfieldInsufficientCreditsError(
  status: number,
  message: string,
): boolean {
  const normalized = message.trim().toLowerCase();
  if (
    normalized === "not_enough_credits" ||
    normalized.includes("not enough credits") ||
    normalized.includes("insufficient balance")
  ) {
    return true;
  }
  return status === 402 || status === 403;
}

/** Turn upstream codes into copy suitable for the UI. */
export function userFacingHiggsfieldErrorMessage(message: string): string {
  if (isHiggsfieldInsufficientCreditsError(0, message)) {
    return HIGGSFIELD_INSUFFICIENT_CREDITS_USER_MESSAGE;
  }
  return message;
}

/** Map upstream Higgsfield HTTP errors to API route status + user-facing text. */
export function mapHiggsfieldUpstreamJobError(
  status: number,
  message: string,
): { httpStatus: number; error: string } {
  if (status === 401) {
    return { httpStatus: 401, error: message };
  }
  if (isHiggsfieldInsufficientCreditsError(status, message)) {
    return {
      httpStatus: 402,
      error: HIGGSFIELD_INSUFFICIENT_CREDITS_USER_MESSAGE,
    };
  }
  return { httpStatus: 502, error: message };
}

export function higgsfieldErrorMessageFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error.trim();
  }
  if (typeof record.detail === "string" && record.detail.trim()) {
    return record.detail.trim();
  }
  if (Array.isArray(record.detail)) {
    const parts = record.detail
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry === "object" && "msg" in entry) {
          const msg = (entry as { msg?: unknown }).msg;
          return typeof msg === "string" ? msg : null;
        }
        return null;
      })
      .filter((part): part is string => Boolean(part));
    if (parts.length > 0) return parts.join(" ");
  }
  return null;
}

export function terminalStatusMessage(status: HiggsfieldTerminalStatus): string {
  switch (status) {
    case "failed":
      return "Higgsfield reported the job as failed.";
    case "nsfw":
      return "Higgsfield moderated this prompt (nsfw).";
    case "canceled":
      return "The Higgsfield job was canceled.";
    case "completed":
      return "Completed.";
  }
}

export async function higgsfieldFetchJson<T>(
  url: string,
  creds: HiggsfieldCredentials,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: higgsfieldAuthHeader(creds),
        ...(init?.headers ?? {}),
      },
    });

    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const message =
        higgsfieldErrorMessageFromPayload(payload) ??
        `Higgsfield request failed (${response.status}).`;
      return { ok: false, status: response.status, message };
    }

    return { ok: true, data: payload as T };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network error calling Higgsfield.";
    return { ok: false, status: 0, message };
  }
}

export async function estimateSoulV2Standard(
  creds: HiggsfieldCredentials,
  body: Record<string, unknown>,
): Promise<
  | { ok: true; estimate: HiggsfieldEstimateResponse }
  | { ok: false; status: number; message: string }
> {
  const result = await higgsfieldFetchJson<HiggsfieldEstimateResponse>(
    `${HIGGSFIELD_API_BASE}/estimate/${SOUL_V2_STANDARD_MODEL_PATH}`,
    creds,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!result.ok) return result;
  return { ok: true, estimate: result.data };
}

export async function submitSoulV2Standard(
  creds: HiggsfieldCredentials,
  body: Record<string, unknown>,
): Promise<
  | { ok: true; submit: HiggsfieldSubmitResponse }
  | { ok: false; status: number; message: string }
> {
  const result = await higgsfieldFetchJson<HiggsfieldSubmitResponse>(
    `${HIGGSFIELD_API_BASE}/${SOUL_V2_STANDARD_MODEL_PATH}`,
    creds,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!result.ok) return result;
  return { ok: true, submit: result.data };
}

export async function fetchHiggsfieldStatus(
  statusUrl: string,
  creds: HiggsfieldCredentials,
): Promise<
  | { ok: true; status: HiggsfieldStatusResponse }
  | { ok: false; status: number; message: string }
> {
  const result = await higgsfieldFetchJson<HiggsfieldStatusResponse>(
    statusUrl,
    creds,
    { method: "GET" },
  );
  if (!result.ok) return result;
  return { ok: true, status: result.data };
}

export type PollOptions = {
  maxWaitMs?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
};

export async function pollHiggsfieldUntilTerminal(
  statusUrl: string,
  creds: HiggsfieldCredentials,
  options: PollOptions = {},
): Promise<
  | { ok: true; result: HiggsfieldStatusResponse }
  | { ok: false; status: number; message: string; timedOut?: boolean }
> {
  const maxWaitMs = options.maxWaitMs ?? 120_000;
  const initialDelayMs = options.initialDelayMs ?? 2_000;
  const maxDelayMs = options.maxDelayMs ?? 10_000;
  const sleep =
    options.sleep ??
    ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  const started = Date.now();
  let delay = initialDelayMs;

  while (Date.now() - started < maxWaitMs) {
    const poll = await fetchHiggsfieldStatus(statusUrl, creds);
    if (!poll.ok) {
      if (poll.status >= 500 || poll.status === 0) {
        await sleep(delay);
        delay = Math.min(delay * 1.5, maxDelayMs);
        continue;
      }
      return poll;
    }

    const status = poll.status.status;
    if (isTerminalHiggsfieldStatus(status)) {
      return { ok: true, result: poll.status };
    }

    const jitter = Math.random() * 500;
    await sleep(delay + jitter);
    delay = Math.min(delay * 1.5, maxDelayMs);
  }

  return {
    ok: false,
    status: 0,
    message: "Timed out waiting for Higgsfield to finish.",
    timedOut: true,
  };
}

export async function uploadReferenceToHiggsfield(
  creds: HiggsfieldCredentials,
  file: { bytes: Uint8Array; contentType: string },
): Promise<
  | { ok: true; publicUrl: string }
  | { ok: false; status: number; message: string }
> {
  const uploadUrlResult = await higgsfieldFetchJson<HiggsfieldUploadUrlResponse>(
    `${HIGGSFIELD_API_BASE}/files/generate-upload-url`,
    creds,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: file.contentType }),
    },
  );
  if (!uploadUrlResult.ok) return uploadUrlResult;

  const { upload_url, public_url, upload_headers } = uploadUrlResult.data;

  try {
    const putResponse = await fetch(upload_url, {
      method: "PUT",
      headers: upload_headers,
      body: Buffer.from(file.bytes),
    });
    if (!putResponse.ok) {
      return {
        ok: false,
        status: putResponse.status,
        message: "Could not upload the reference image to Higgsfield storage.",
      };
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Network error uploading reference image.";
    return { ok: false, status: 0, message };
  }

  return { ok: true, publicUrl: public_url };
}

export function firstImageUrl(result: HiggsfieldStatusResponse): string | null {
  const url = result.images?.[0]?.url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

export function firstVideoUrl(result: HiggsfieldStatusResponse): string | null {
  const url = result.video?.url;
  if (typeof url === "string" && url.length > 0) return url;

  const record = result as HiggsfieldStatusResponse & {
    jobs?: Array<{
      results?: { raw?: { url?: string } };
    }>;
  };
  const sdkUrl = record.jobs?.[0]?.results?.raw?.url;
  return typeof sdkUrl === "string" && sdkUrl.length > 0 ? sdkUrl : null;
}

export function buildSeedanceTextToVideoBody(
  prompt: string,
  aspectRatio: AspectRatio,
): Record<string, unknown> {
  return {
    prompt,
    aspect_ratio: aspectRatio,
    resolution: "720p",
    duration: 5,
    output_format: "mp4",
    generate_audio: false,
  };
}

export async function submitSeedanceTextToVideo(
  creds: HiggsfieldCredentials,
  body: Record<string, unknown>,
): Promise<
  | { ok: true; submit: HiggsfieldSubmitResponse }
  | { ok: false; status: number; message: string }
> {
  const result = await higgsfieldFetchJson<HiggsfieldSubmitResponse>(
    `${HIGGSFIELD_API_BASE}/${SEEDANCE_TEXT_TO_VIDEO_MODEL_PATH}`,
    creds,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!result.ok) return result;
  return { ok: true, submit: result.data };
}
