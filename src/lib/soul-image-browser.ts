import {
  type ImageJobResponse,
  isImageJobResponse,
  isSoulImageSubmitPollingResponse,
} from "@/lib/generation-types";
import {
  HIGGSFIELD_POLL_INITIAL_DELAY_MS,
  HIGGSFIELD_POLL_MAX_DELAY_MS,
  higgsfieldClientPollMaxWaitMs,
} from "@/lib/vercel-runtime";
import type { AspectRatio } from "@/lib/studio-recipe";

export type RunSoulImageInBrowserInput = {
  submit: () => Promise<Response>;
  aspectRatio: AspectRatio;
  apiKeyId: string;
  apiKeySecret: string;
  excludeOutputUrls: string[];
  usedReferenceUpload?: boolean;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error(
      response.ok
        ? "Invalid response from the server."
        : `Soul job failed (${response.status}). Try again.`,
    );
  }
}

async function pollOnce(input: {
  statusUrl: string;
  aspectRatio: AspectRatio;
  apiKeyId: string;
  apiKeySecret: string;
  excludeOutputUrls: string[];
  usedReferenceUpload?: boolean;
  clientTimedOut?: boolean;
}): Promise<ImageJobResponse | { phase: "polling"; requestId: string }> {
  const response = await fetch("/api/higgsfield/image/poll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      statusUrl: input.statusUrl,
      aspectRatio: input.aspectRatio,
      apiKeyId: input.apiKeyId,
      apiKeySecret: input.apiKeySecret,
      excludeOutputUrls: input.excludeOutputUrls,
      usedReferenceUpload: input.usedReferenceUpload,
      clientTimedOut: input.clientTimedOut ?? false,
    }),
  });

  const payload = await readJson(response);
  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload &&
      "error" in payload &&
      typeof (payload as { error: unknown }).error === "string"
        ? (payload as { error: string }).error
        : "Could not poll Higgsfield job status.";
    throw new Error(message);
  }

  if (isImageJobResponse(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object" &&
    (payload as { phase?: string }).phase === "polling" &&
    typeof (payload as { requestId?: string }).requestId === "string"
  ) {
    return {
      phase: "polling",
      requestId: (payload as { requestId: string }).requestId,
    };
  }

  throw new Error("Unexpected poll response from the server.");
}

/**
 * Submit Soul v2, then poll from the browser so Vercel functions stay short.
 */
export async function runSoulV2ImageInBrowser(
  input: RunSoulImageInBrowserInput,
): Promise<ImageJobResponse> {
  const submitResponse = await input.submit();
  const submitPayload = await readJson(submitResponse);
  if (!submitResponse.ok) {
    const message =
      typeof submitPayload === "object" &&
      submitPayload &&
      "error" in submitPayload &&
      typeof (submitPayload as { error: unknown }).error === "string"
        ? (submitPayload as { error: string }).error
        : "Real Soul job failed. Try again.";
    throw new Error(message);
  }

  if (isImageJobResponse(submitPayload)) {
    return submitPayload;
  }

  if (!isSoulImageSubmitPollingResponse(submitPayload)) {
    throw new Error("Unexpected submit response from the server.");
  }

  const statusUrl = submitPayload.statusUrl;
  const usedReferenceUpload = submitPayload.usedReferenceUpload;
  const maxWaitMs = higgsfieldClientPollMaxWaitMs();
  const started = Date.now();
  let delay = HIGGSFIELD_POLL_INITIAL_DELAY_MS;

  while (Date.now() - started < maxWaitMs) {
    await sleep(delay + Math.random() * 500);
    const polled = await pollOnce({
      statusUrl,
      aspectRatio: input.aspectRatio,
      apiKeyId: input.apiKeyId,
      apiKeySecret: input.apiKeySecret,
      excludeOutputUrls: input.excludeOutputUrls,
      usedReferenceUpload,
    });
    if (isImageJobResponse(polled)) {
      return polled;
    }
    delay = Math.min(delay * 1.5, HIGGSFIELD_POLL_MAX_DELAY_MS);
  }

  const fallback = await pollOnce({
    statusUrl,
    aspectRatio: input.aspectRatio,
    apiKeyId: input.apiKeyId,
    apiKeySecret: input.apiKeySecret,
    excludeOutputUrls: input.excludeOutputUrls,
    usedReferenceUpload,
    clientTimedOut: true,
  });

  if (isImageJobResponse(fallback)) {
    return fallback;
  }

  throw new Error("Timed out waiting for Higgsfield to finish.");
}
