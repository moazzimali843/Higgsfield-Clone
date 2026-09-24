import { pickDemoOutputUrl } from "@/lib/demo-image-job";
import {
  buildSoulV2StandardBody,
  estimateSoulV2Standard,
  firstImageUrl,
  isHiggsfieldAuthOrAvailabilityError,
  isTerminalHiggsfieldStatus,
  pollHiggsfieldUntilTerminal,
  resolveHiggsfieldCredentials,
  submitSoulV2Standard,
  terminalStatusMessage,
  uploadReferenceToHiggsfield,
  type HiggsfieldEnv,
} from "@/lib/higgsfield-client";
import type {
  DemoFallbackImageJobResponse,
  HiggsfieldImageJobResponse,
  ImageJobResponse,
} from "@/lib/generation-types";
import type { SoulImageJobFields } from "@/lib/higgsfield-request";
import type { AspectRatio } from "@/lib/studio-recipe";

export type RunSoulImageJobInput = SoulImageJobFields & {
  reference?: { bytes: Uint8Array; contentType: string; fileName: string };
  excludeOutputUrls?: string[];
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

export async function runSoulV2ImageJob(
  input: RunSoulImageJobInput,
): Promise<
  | { ok: true; result: ImageJobResponse }
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

  const polled = await pollHiggsfieldUntilTerminal(
    submitted.submit.status_url,
    creds,
  );
  if (!polled.ok) {
    if (
      polled.timedOut ||
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

  const terminal = polled.result.status;
  if (!isTerminalHiggsfieldStatus(terminal)) {
    return {
      ok: true,
      result: demoFallback(
        input.aspectRatio,
        "Higgsfield did not reach a finished state.",
        input.excludeOutputUrls,
      ),
    };
  }

  if (terminal !== "completed") {
    return {
      ok: true,
      result: demoFallback(
        input.aspectRatio,
        terminalStatusMessage(terminal),
        input.excludeOutputUrls,
      ),
    };
  }

  const outputUrl = firstImageUrl(polled.result);
  if (!outputUrl) {
    return {
      ok: true,
      result: demoFallback(
        input.aspectRatio,
        "Higgsfield completed but returned no image URL.",
        input.excludeOutputUrls,
      ),
    };
  }

  const success: HiggsfieldImageJobResponse = {
    status: "completed",
    source: "higgsfield",
    outputUrl,
    requestId: polled.result.request_id,
    retentionNote:
      "Higgsfield hosts this file for at least 7 days. Download it if you need a permanent copy.",
    usedReferenceUpload: Boolean(input.reference),
  };

  return { ok: true, result: success };
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
