import { pickDemoOutputUrl } from "@/lib/demo-image-job";
import {
  buildSoulV2StandardBody,
  estimateSoulV2Standard,
  fetchHiggsfieldStatus,
  firstImageUrl,
  isAllowedHiggsfieldStatusUrl,
  isHiggsfieldAuthOrAvailabilityError,
  isTerminalHiggsfieldStatus,
  resolveHiggsfieldCredentials,
  submitSoulV2Standard,
  terminalStatusMessage,
  uploadReferenceToHiggsfield,
  type HiggsfieldEnv,
  type HiggsfieldStatusResponse,
} from "@/lib/higgsfield-client";
import {
  isSoulImagePollInProgressResponse,
  type DemoFallbackImageJobResponse,
  type HiggsfieldImageJobResponse,
  type ImageJobResponse,
  type SoulImagePollInProgressResponse,
  type SoulImageSubmitPollingResponse,
} from "@/lib/generation-types";
import type { SoulImageJobFields } from "@/lib/higgsfield-request";
import type { AspectRatio } from "@/lib/studio-recipe";

export type RunSoulImageJobInput = SoulImageJobFields & {
  reference?: { bytes: Uint8Array; contentType: string; fileName: string };
  excludeOutputUrls?: string[];
  env: HiggsfieldEnv;
};

export type PollSoulImageJobInput = SoulImageJobFields & {
  statusUrl: string;
  excludeOutputUrls?: string[];
  usedReferenceUpload?: boolean;
  clientTimedOut?: boolean;
  env: HiggsfieldEnv;
};

function demoFallback(
  aspectRatio: AspectRatio,
  fallbackReason: string,
  excludeOutputUrls?: string[],
): DemoFallbackImageJobResponse {
  return {
    status: "completed",
    source: "demo",
    outputUrl: pickDemoOutputUrl(aspectRatio, {
      excludeUrls: excludeOutputUrls,
    }),
    usedDemoFallbackForModel: true,
    fallbackReason,
  };
}

export function mapHiggsfieldStatusToImageJob(
  statusResponse: HiggsfieldStatusResponse,
  input: {
    aspectRatio: AspectRatio;
    excludeOutputUrls?: string[];
    usedReferenceUpload?: boolean;
  },
): ImageJobResponse | SoulImagePollInProgressResponse {
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
      input.aspectRatio,
      "Higgsfield returned an unexpected job status.",
      input.excludeOutputUrls,
    );
  }

  if (status !== "completed") {
    return demoFallback(
      input.aspectRatio,
      terminalStatusMessage(status),
      input.excludeOutputUrls,
    );
  }

  const outputUrl = firstImageUrl(statusResponse);
  if (!outputUrl) {
    return demoFallback(
      input.aspectRatio,
      "Higgsfield completed but returned no image URL.",
      input.excludeOutputUrls,
    );
  }

  const success: HiggsfieldImageJobResponse = {
    status: "completed",
    source: "higgsfield",
    outputUrl,
    requestId: statusResponse.request_id,
    retentionNote:
      "Higgsfield hosts this file for at least 7 days. Download it if you need a permanent copy.",
    usedReferenceUpload: Boolean(input.usedReferenceUpload),
  };

  return success;
}

export async function submitSoulV2ImageJob(
  input: RunSoulImageJobInput,
): Promise<
  | { ok: true; result: ImageJobResponse | SoulImageSubmitPollingResponse }
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
        "Add your Higgsfield API key ID and secret for a real Soul render, or switch to the Demo model.",
    };
  }

  let imageUrl: string | undefined;
  if (input.reference) {
    const uploaded = await uploadReferenceToHiggsfield(creds, input.reference);
    if (!uploaded.ok) {
      if (isHiggsfieldAuthOrAvailabilityError(uploaded.status)) {
        return {
          ok: true,
          result: demoFallback(
            input.aspectRatio,
            uploaded.message,
            input.excludeOutputUrls,
          ),
        };
      }
      return { ok: false, status: 502, error: uploaded.message };
    }
    imageUrl = uploaded.publicUrl;
  }

  const body = buildSoulV2StandardBody(input.prompt, input.aspectRatio, {
    imageUrl,
  });

  const submitted = await submitSoulV2Standard(creds, body);
  if (!submitted.ok) {
    if (isHiggsfieldAuthOrAvailabilityError(submitted.status)) {
      return {
        ok: true,
        result: demoFallback(
          input.aspectRatio,
          submitted.message,
          input.excludeOutputUrls,
        ),
      };
    }
    return { ok: false, status: 502, error: submitted.message };
  }

  if (!isAllowedHiggsfieldStatusUrl(submitted.submit.status_url)) {
    return {
      ok: true,
      result: demoFallback(
        input.aspectRatio,
        "Unexpected Higgsfield status URL.",
        input.excludeOutputUrls,
      ),
    };
  }

  const immediate = submitted.submit.status;
  if (isTerminalHiggsfieldStatus(immediate)) {
    const mapped = mapHiggsfieldStatusToImageJob(
      { ...submitted.submit, status: immediate },
      {
        aspectRatio: input.aspectRatio,
        excludeOutputUrls: input.excludeOutputUrls,
        usedReferenceUpload: Boolean(input.reference),
      },
    );
    if (isSoulImagePollInProgressResponse(mapped)) {
      return {
        ok: true,
        result: demoFallback(
          input.aspectRatio,
          "Higgsfield returned a non-terminal status after submit.",
          input.excludeOutputUrls,
        ),
      };
    }
    return { ok: true, result: mapped };
  }

  const polling: SoulImageSubmitPollingResponse = {
    phase: "polling",
    statusUrl: submitted.submit.status_url,
    requestId: submitted.submit.request_id,
    usedReferenceUpload: Boolean(input.reference),
  };

  return { ok: true, result: polling };
}

export async function pollSoulV2ImageJobOnce(
  input: PollSoulImageJobInput,
): Promise<
  | { ok: true; result: ImageJobResponse | SoulImagePollInProgressResponse }
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
        "Add your Higgsfield API key ID and secret for a real Soul render, or switch to the Demo model.",
    };
  }

  if (!isAllowedHiggsfieldStatusUrl(input.statusUrl)) {
    return {
      ok: true,
      result: demoFallback(
        input.aspectRatio,
        "Unexpected Higgsfield status URL.",
        input.excludeOutputUrls,
      ),
    };
  }

  if (input.clientTimedOut) {
    return {
      ok: true,
      result: demoFallback(
        input.aspectRatio,
        "Timed out waiting for Higgsfield to finish.",
        input.excludeOutputUrls,
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
          input.aspectRatio,
          polled.message,
          input.excludeOutputUrls,
        ),
      };
    }
    return { ok: false, status: 502, error: polled.message };
  }

  const mapped = mapHiggsfieldStatusToImageJob(polled.status, {
    aspectRatio: input.aspectRatio,
    excludeOutputUrls: input.excludeOutputUrls,
    usedReferenceUpload: input.usedReferenceUpload,
  });

  return { ok: true, result: mapped };
}

export async function fetchSoulV2Estimate(
  fields: SoulImageJobFields,
  env: HiggsfieldEnv,
  imageUrl?: string,
): Promise<
  | { ok: true; credits: string; usd: string }
  | { ok: false; error: string; status: number }
> {
  const creds = resolveHiggsfieldCredentials(
    {
      apiKeyId: fields.apiKeyId,
      apiKeySecret: fields.apiKeySecret,
    },
    env,
  );
  if (!creds) {
    return {
      ok: false,
      status: 400,
      error: "API key ID and secret are required to estimate cost.",
    };
  }

  const body = buildSoulV2StandardBody(fields.prompt, fields.aspectRatio, {
    imageUrl,
  });
  const estimate = await estimateSoulV2Standard(creds, body);
  if (!estimate.ok) {
    return {
      ok: false,
      status: estimate.status === 401 ? 401 : 502,
      error: estimate.message,
    };
  }

  return {
    ok: true,
    credits: estimate.estimate.credits,
    usd: estimate.estimate.usd,
  };
}
