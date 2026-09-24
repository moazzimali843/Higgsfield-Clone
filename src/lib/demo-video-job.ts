import { demoOutputVideosByAspect } from "@/data/demo-output-videos";
import type { DemoVideoJobRequest, DemoVideoJobResponse } from "@/lib/generation-types";
import {
  hashPromptForDemo,
  parseDemoImageJobRequest,
} from "@/lib/demo-image-job";
import type { AspectRatio } from "@/lib/studio-recipe";

export { DEMO_JOB_DELAY_MS } from "@/lib/demo-image-job";

export function pickDemoVideoOutputUrl(
  prompt: string,
  aspectRatio: AspectRatio,
): string {
  const pool =
    demoOutputVideosByAspect[aspectRatio] ?? demoOutputVideosByAspect["16:9"];
  const index = hashPromptForDemo(prompt) % pool.length;
  return pool[index];
}

/** Same JSON shape as the image demo job. */
export const parseDemoVideoJobRequest = parseDemoImageJobRequest;

export function runDemoVideoJob(
  request: DemoVideoJobRequest,
): DemoVideoJobResponse {
  return {
    status: "completed",
    source: "demo",
    outputUrl: pickDemoVideoOutputUrl(request.prompt, request.aspectRatio),
    usedDemoFallbackForModel: request.modelId !== "demo",
  };
}
