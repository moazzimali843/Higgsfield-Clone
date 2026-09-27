import { pickDemoOutputUrl } from "@/lib/demo-image-job";
import {
  buildSoulV2StandardBody,
  estimateSoulV2Standard,
  fetchHiggsfieldStatus,
  firstImageUrl,
  isAllowedHiggsfieldStatusUrl,
  isHiggsfieldInsufficientCreditsError,
  isHiggsfieldModelAvailabilityError,
  isTerminalHiggsfieldStatus,
  mapHiggsfieldUpstreamJobError,
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
      apiCredentials: input.apiCredentials,
    },
    input.env,
  );
  if (!creds) {
    return {
      ok: false,
      status: 400,
      error:
        "Add your Higgsfield API credentials (key-id:key-secret from the console) for Soul v2, or switch to the Demo model.",
    };
  }

  let imageUrl: string | undefined;
  if (input.reference) {
    const uploaded = await uploadReferenceToHiggsfield(creds, input.reference);
    if (!uploaded.ok) {
      if (uploaded.status === 401) {
        return { ok: false, status: 401, error: uploaded.message };
      }
      if (isHiggsfieldModelAvailabilityError(uploaded.status)) {
        return {
          ok: true,
          result: demoFallback(
            input.aspectRatio,
            uploaded.message,
            input.excludeOutputUrls,
          ),
        };
      }
      const uploadErr = mapHiggsfieldUpstreamJobError(
        uploaded.status,
        uploaded.message,
      );
      return {
        ok: false,
        status: uploadErr.httpStatus,
        error: uploadErr.error,
      };
    }
    imageUrl = uploaded.publicUrl;
  }

  const body = buildSoulV2StandardBody(input.prompt, input.aspectRatio, {
    imageUrl,
  });

  const submitted = await submitSoulV2Standard(creds, body);
  if (!submitted.ok) {
    if (isHiggsfieldInsufficientCreditsError(submitted.status, submitted.message)) {
      const submitErr = mapHiggsfieldUpstreamJobError(
        submitted.status,
        submitted.message,
      );
      return {
        ok: false,
        status: submitErr.httpStatus,
        error: submitErr.error,
      };
    }
    if (submitted.status === 401) {
      return { ok: false, status: 401, error: submitted.message };
    }
    if (isHiggsfieldModelAvailabilityError(submitted.status)) {
      return {
        ok: true,
        result: demoFallback(
          input.aspectRatio,
          submitted.message,
          input.excludeOutputUrls,
        ),
      };
    }
    const submitErr = mapHiggsfieldUpstreamJobError(
      submitted.status,
      submitted.message,
    );
    return {
      ok: false,
      status: submitErr.httpStatus,
      error: submitErr.error,
    };
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
      apiCredentials: input.apiCredentials,
    },
    input.env,
  );
  if (!creds) {
    return {
      ok: false,
      status: 400,
      error:
        "Add your Higgsfield API credentials (key-id:key-secret from the console) for Soul v2, or switch to the Demo model.",
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
    if (polled.status === 401) {
      return { ok: false, status: 401, error: polled.message };
    }
    if (
      polled.status >= 500 ||
      polled.status === 0 ||
      isHiggsfieldModelAvailabilityError(polled.status)
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
    const pollErr = mapHiggsfieldUpstreamJobError(polled.status, polled.message);
    return {
      ok: false,
      status: pollErr.httpStatus,
      error: pollErr.error,
    };
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
      apiCredentials: fields.apiCredentials,
    },
    env,
  );
  if (!creds) {
    return {
      ok: false,
      status: 400,
      error:
        "API credentials (key-id:key-secret) are required to estimate cost.",
    };
  }

  const body = buildSoulV2StandardBody(fields.prompt, fields.aspectRatio, {
    imageUrl,
  });
  const estimate = await estimateSoulV2Standard(creds, body);
  if (!estimate.ok) {
    const estimateErr = mapHiggsfieldUpstreamJobError(
      estimate.status,
      estimate.message,
    );
    return {
      ok: false,
      status: estimateErr.httpStatus,
      error: estimateErr.error,
    };
  }

  return {
    ok: true,
    credits: estimate.estimate.credits,
    usd: estimate.estimate.usd,
  };
}
