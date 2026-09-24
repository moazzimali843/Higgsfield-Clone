import { pickDemoVideoOutputUrl } from "@/lib/demo-video-job";
import {
  buildSeedanceTextToVideoBody,
  fetchHiggsfieldStatus,
  firstVideoUrl,
  isAllowedHiggsfieldStatusUrl,
  isHiggsfieldAuthOrAvailabilityError,
  isTerminalHiggsfieldStatus,
  resolveHiggsfieldCredentials,
  submitSeedanceTextToVideo,
  terminalStatusMessage,
  type HiggsfieldEnv,
  type HiggsfieldStatusResponse,
} from "@/lib/higgsfield-client";
import {
  isSeedanceVideoPollInProgressResponse,
  type DemoFallbackVideoJobResponse,
  type HiggsfieldVideoJobResponse,
  type SeedanceVideoPollInProgressResponse,
  type SeedanceVideoSubmitPollingResponse,
  type VideoJobResponse,
} from "@/lib/generation-types";
import type { SoulImageJobFields } from "@/lib/higgsfield-request";
import type { AspectRatio } from "@/lib/studio-recipe";

export type RunSeedanceVideoJobInput = SoulImageJobFields & {
  excludeOutputUrls?: string[];
  env: HiggsfieldEnv;
};

export type PollSeedanceVideoJobInput = SoulImageJobFields & {
  statusUrl: string;
  clientTimedOut?: boolean;
  env: HiggsfieldEnv;
};

function demoFallback(
  prompt: string,
  aspectRatio: AspectRatio,
  fallbackReason: string,
): DemoFallbackVideoJobResponse {
  return {
    status: "completed",
    source: "demo",
    outputUrl: pickDemoVideoOutputUrl(prompt, aspectRatio),
    usedDemoFallbackForModel: true,
    fallbackReason,
  };
}

export function mapHiggsfieldStatusToVideoJob(
  statusResponse: HiggsfieldStatusResponse,
  input: {
    prompt: string;
    aspectRatio: AspectRatio;
  },
): VideoJobResponse | SeedanceVideoPollInProgressResponse {
  const status = statusResponse.status;
  if (!isTerminalHiggsfieldStatus(status)) {
    if (status === "queued" || status === "in_progress") {
      return {
        phase: "polling",
        higgsfieldStatus: status,
        requestId: statusResponse.request_id,
      };
    }
    return demoFallback(
      input.prompt,
      input.aspectRatio,
      "Higgsfield returned an unexpected job status.",
    );
  }

  if (status !== "completed") {
    return demoFallback(
      input.prompt,
      input.aspectRatio,
      terminalStatusMessage(status),
    );
  }

  const outputUrl = firstVideoUrl(statusResponse);
  if (!outputUrl) {
    return demoFallback(
      input.prompt,
      input.aspectRatio,
      "Higgsfield completed but returned no video URL.",
    );
  }

  const success: HiggsfieldVideoJobResponse = {
    status: "completed",
    source: "higgsfield",
    outputUrl,
    requestId: statusResponse.request_id,
    retentionNote:
      "Higgsfield hosts this file for at least 7 days. Download it if you need a permanent copy.",
  };

  return success;
}

export async function submitSeedanceVideoJob(
  input: RunSeedanceVideoJobInput,
): Promise<
  | { ok: true; result: VideoJobResponse | SeedanceVideoSubmitPollingResponse }
  | { ok: false; error: string; status: number }
> {
  const creds = resolveHiggsfieldCredentials(
    {
      apiKeyId: input.apiKeyId,
      apiKeySecret: input.apiKeySecret,
    },
    input.env,
  );
  if (!creds) {
    return {
      ok: false,
      status: 400,
      error:
        "Add your Higgsfield API key ID and secret for Seedance 2.5, or switch to the Demo model.",
    };
  }

  const body = buildSeedanceTextToVideoBody(input.prompt, input.aspectRatio);

  const submitted = await submitSeedanceTextToVideo(creds, body);
  if (!submitted.ok) {
    if (isHiggsfieldAuthOrAvailabilityError(submitted.status)) {
      return {
        ok: true,
        result: demoFallback(
          input.prompt,
          input.aspectRatio,
          submitted.message,
        ),
      };
    }
    return { ok: false, status: 502, error: submitted.message };
  }

  if (!isAllowedHiggsfieldStatusUrl(submitted.submit.status_url)) {
    return {
      ok: true,
      result: demoFallback(
        input.prompt,
        input.aspectRatio,
        "Unexpected Higgsfield status URL.",
      ),
    };
  }

  const immediate = submitted.submit.status;
  if (isTerminalHiggsfieldStatus(immediate)) {
    const mapped = mapHiggsfieldStatusToVideoJob(
      { ...submitted.submit, status: immediate },
      {
        prompt: input.prompt,
        aspectRatio: input.aspectRatio,
      },
    );
    if (isSeedanceVideoPollInProgressResponse(mapped)) {
      return {
        ok: true,
        result: demoFallback(
          input.prompt,
          input.aspectRatio,
          "Higgsfield returned a non-terminal status after submit.",
        ),
      };
    }
    return { ok: true, result: mapped };
  }

  const polling: SeedanceVideoSubmitPollingResponse = {
    phase: "polling",
    statusUrl: submitted.submit.status_url,
    requestId: submitted.submit.request_id,
  };

  return { ok: true, result: polling };
}

export async function pollSeedanceVideoJobOnce(
  input: PollSeedanceVideoJobInput,
): Promise<
  | { ok: true; result: VideoJobResponse | SeedanceVideoPollInProgressResponse }
  | { ok: false; error: string; status: number }
> {
  const creds = resolveHiggsfieldCredentials(
    {
      apiKeyId: input.apiKeyId,
      apiKeySecret: input.apiKeySecret,
    },
    input.env,
  );
  if (!creds) {
    return {
      ok: false,
      status: 400,
      error:
        "Add your Higgsfield API key ID and secret for Seedance 2.5, or switch to the Demo model.",
    };
  }

  if (!isAllowedHiggsfieldStatusUrl(input.statusUrl)) {
    return {
      ok: true,
      result: demoFallback(
        input.prompt,
        input.aspectRatio,
        "Unexpected Higgsfield status URL.",
      ),
    };
  }

  if (input.clientTimedOut) {
    return {
      ok: true,
      result: demoFallback(
        input.prompt,
        input.aspectRatio,
        "Timed out waiting for Higgsfield to finish.",
      ),
    };
  }

  const polled = await fetchHiggsfieldStatus(input.statusUrl, creds);
  if (!polled.ok) {
    if (
      polled.status >= 500 ||
      polled.status === 0 ||
      isHiggsfieldAuthOrAvailabilityError(polled.status)
    ) {
      return {
        ok: true,
        result: demoFallback(
          input.prompt,
          input.aspectRatio,
          polled.message,
        ),
      };
    }
    return { ok: false, status: 502, error: polled.message };
  }

  const mapped = mapHiggsfieldStatusToVideoJob(polled.status, {
    prompt: input.prompt,
    aspectRatio: input.aspectRatio,
  });

  return { ok: true, result: mapped };
}
