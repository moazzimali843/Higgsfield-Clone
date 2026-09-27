"use client";

import Image from "next/image";
import Link from "next/link";
import { GenerationSourceBadge } from "@/components/GenerationSourceBadge";
import { ShimmerBlock } from "@/components/ShimmerBlock";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";
import { userFacingHiggsfieldErrorMessage } from "@/lib/higgsfield-client";
import type { ImageJobResponse } from "@/lib/generation-types";
import type { AspectRatio } from "@/lib/studio-recipe";

export type StudioImageJobPhase = "idle" | "pending" | "done" | "error";

export type StudioImageJobState = {
  phase: StudioImageJobPhase;
  error: string | null;
  result: ImageJobResponse | null;
  savedToLibrary: boolean;
  aspectRatio: AspectRatio;
};

export const idleStudioImageJobState: StudioImageJobState = {
  phase: "idle",
  error: null,
  result: null,
  savedToLibrary: false,
  aspectRatio: "1:1",
};

type StudioCreateImageResultProps = {
  state: StudioImageJobState;
};

export function StudioCreateImageResult({ state }: StudioCreateImageResultProps) {
  const { phase, error, result, savedToLibrary, aspectRatio } = state;

  if (phase === "idle") {
    return null;
  }

  const aspectClass = aspectClassForRatio(aspectRatio);
  const usesRemoteCdn =
    result?.outputUrl.includes("images.pexels.com") === false;

  return (
    <div
      className="w-full text-left"
      aria-live="polite"
      aria-busy={phase === "pending"}
    >
      {phase === "pending" ? (
        <div className="studio-card overflow-hidden p-4 sm:p-5">
          <p className="text-sm font-medium text-studio-fg">Creating…</p>
          <p className="mt-1 text-xs text-studio-muted">
            Your image is on the way. This usually takes a few seconds.
          </p>
          <div className="mt-4 space-y-2" aria-hidden>
            <ShimmerBlock
              className={`w-full max-w-md rounded-xl ${aspectClass}`}
              label="Creating image"
            />
          </div>
        </div>
      ) : null}

      {phase === "error" && error ? (
        <p className="studio-alert-warning-xs rounded-xl px-4 py-3 text-left text-xs" role="alert">
          {userFacingHiggsfieldErrorMessage(error)}
        </p>
      ) : null}

      {phase === "done" && result ? (
        <div className="studio-card overflow-hidden p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-medium text-studio-fg">Your image</h2>
            <GenerationSourceBadge source={result.source} />
          </div>
          {result.source === "demo" && result.usedDemoFallbackForModel ? (
            <p className="mt-2 text-xs studio-alert-warning-xs">
              We couldn&apos;t finish on the API, so this is a demo preview
              instead.
            </p>
          ) : null}
          <div
            className={`relative mt-4 w-full max-w-md overflow-hidden rounded-xl border border-studio-border-subtle ${aspectClass}`}
          >
            <Image
              src={result.outputUrl}
              alt="Generated image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 36rem"
              unoptimized={usesRemoteCdn}
              priority
            />
          </div>
          {savedToLibrary ? (
            <p className="mt-3 text-xs text-studio-muted">
              Saved to{" "}
              <Link href="/library" className="font-medium text-studio-accent hover:underline">
                Library
              </Link>
              .
            </p>
          ) : (
            <p className="mt-3 text-xs studio-alert-warning-xs" role="status">
              Couldn&apos;t save to Library — check browser storage.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
