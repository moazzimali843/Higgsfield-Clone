import {
  type VideoJobResponse,
  isSeedanceVideoSubmitPollingResponse,
  isVideoJobResponse,
} from "@/lib/generation-types";
import {
  HIGGSFIELD_POLL_INITIAL_DELAY_MS,
  HIGGSFIELD_POLL_MAX_DELAY_MS,
  higgsfieldClientPollMaxWaitMs,
} from "@/lib/vercel-runtime";
import type { AspectRatio } from "@/lib/studio-recipe";

export type RunSeedanceVideoInBrowserInput = {
  submit: () => Promise<Response>;
  prompt: string;
  aspectRatio: AspectRatio;
  apiKeyId: string;
  apiKeySecret: string;
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
        : `Seedance job failed (${response.status}). Try again.`,
    );
  }
}

async function pollOnce(input: {
  statusUrl: string;
  prompt: string;
  aspectRatio: AspectRatio;
  apiKeyId: string;
  apiKeySecret: string;
  clientTimedOut?: boolean;
}): Promise<VideoJobResponse | { phase: "polling"; requestId: string }> {
  const response = await fetch("/api/higgsfield/video/poll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      statusUrl: input.statusUrl,
      prompt: input.prompt,
      aspectRatio: input.aspectRatio,
      apiKeyId: input.apiKeyId,
      apiKeySecret: input.apiKeySecret,
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

  if (isVideoJobResponse(payload)) {
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

/** Submit Seedance 2.5, then poll from the browser so Vercel functions stay short. */
export async function runSeedanceVideoInBrowser(
  input: RunSeedanceVideoInBrowserInput,
): Promise<VideoJobResponse> {
  const submitResponse = await input.submit();
  const submitPayload = await readJson(submitResponse);
  if (!submitResponse.ok) {
    const message =
      typeof submitPayload === "object" &&
      submitPayload &&
      "error" in submitPayload &&
      typeof (submitPayload as { error: unknown }).error === "string"
        ? (submitPayload as { error: string }).error
        : "Real Seedance job failed. Try again.";
    throw new Error(message);
  }

  if (isVideoJobResponse(submitPayload)) {
    return submitPayload;
  }

  if (!isSeedanceVideoSubmitPollingResponse(submitPayload)) {
    throw new Error("Unexpected submit response from the server.");
  }

  const statusUrl = submitPayload.statusUrl;
  const maxWaitMs = higgsfieldClientPollMaxWaitMs();
  const started = Date.now();
  let delay = HIGGSFIELD_POLL_INITIAL_DELAY_MS;

  while (Date.now() - started < maxWaitMs) {
    await sleep(delay + Math.random() * 500);
    const polled = await pollOnce({
      statusUrl,
      prompt: input.prompt,
      aspectRatio: input.aspectRatio,
      apiKeyId: input.apiKeyId,
      apiKeySecret: input.apiKeySecret,
    });
    if (isVideoJobResponse(polled)) {
      return polled;
    }
    delay = Math.min(delay * 1.5, HIGGSFIELD_POLL_MAX_DELAY_MS);
  }

  const fallback = await pollOnce({
    statusUrl,
    prompt: input.prompt,
    aspectRatio: input.aspectRatio,
    apiKeyId: input.apiKeyId,
    apiKeySecret: input.apiKeySecret,
    clientTimedOut: true,
  });

  if (isVideoJobResponse(fallback)) {
    return fallback;
  }

  throw new Error("Timed out waiting for Higgsfield to finish.");
}
