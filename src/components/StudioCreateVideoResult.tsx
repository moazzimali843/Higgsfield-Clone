"use client";

import Link from "next/link";
import { GenerationSourceBadge } from "@/components/GenerationSourceBadge";
import { PreviewVideo } from "@/components/PreviewVideo";
import { ShimmerBlock } from "@/components/ShimmerBlock";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";
import { userFacingHiggsfieldErrorMessage } from "@/lib/higgsfield-client";
import type { VideoJobResponse } from "@/lib/generation-types";
import type { AspectRatio } from "@/lib/studio-recipe";

export type StudioVideoJobPhase = "idle" | "pending" | "done" | "error";

export type StudioVideoJobState = {
  phase: StudioVideoJobPhase;
  error: string | null;
  result: VideoJobResponse | null;
  savedToLibrary: boolean;
  aspectRatio: AspectRatio;
};

export const idleStudioVideoJobState: StudioVideoJobState = {
  phase: "idle",
  error: null,
  result: null,
  savedToLibrary: false,
  aspectRatio: "16:9",
};

type StudioCreateVideoResultProps = {
  state: StudioVideoJobState;
};

export function StudioCreateVideoResult({ state }: StudioCreateVideoResultProps) {
  const { phase, error, result, savedToLibrary, aspectRatio } = state;

  if (phase === "idle") {
    return null;
  }

  const aspectClass = aspectClassForRatio(aspectRatio);

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
            Video can take a minute or two.
          </p>
          <div className="mt-4 space-y-2" aria-hidden>
            <ShimmerBlock
              className={`w-full max-w-md rounded-xl ${aspectClass}`}
              label="Creating video"
            />
          </div>
        </div>
      ) : null}

      {phase === "error" && error ? (
        <p
          className="studio-alert-warning-xs rounded-xl px-4 py-3 text-left text-xs"
          role="alert"
        >
          {userFacingHiggsfieldErrorMessage(error)}
        </p>
      ) : null}

      {phase === "done" && result ? (
        <div className="studio-card overflow-hidden p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-medium text-studio-fg">Your video</h2>
            <GenerationSourceBadge source={result.source} mediaType="video" />
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
            <PreviewVideo src={result.outputUrl} alt="Generated video" />
          </div>
          {savedToLibrary ? (
            <p className="mt-3 text-xs text-studio-muted">
              Saved to{" "}
              <Link
                href="/library"
                className="font-medium text-studio-accent hover:underline"
              >
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
