"use client";

import Link from "next/link";
import Image from "next/image";
import { GenerationSourceBadge } from "@/components/GenerationSourceBadge";
import { GenerationRecipePanel } from "@/components/GenerationRecipePanel";
import { PreviewVideo } from "@/components/PreviewVideo";
import { useEffect, useMemo, useState } from "react";
import { useClientHydrated } from "@/hooks/use-client-hydrated";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";
import type { LibraryGeneration } from "@/lib/generation-types";
import {
  isShowcaseGenerationId,
  isValidUuid,
} from "@/lib/generations-db";
import {
  findLibraryGenerationById,
  getLibraryShowcaseGenerations,
  mergeSavedLibraryWithShowcase,
} from "@/lib/studio-library";
import { fetchRemoteLibraryGenerationById } from "@/lib/studio-library-remote";

function formatCreatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type LibraryGenerationDetailClientProps = {
  generationId: string;
};

export function LibraryGenerationDetailClient({
  generationId,
}: LibraryGenerationDetailClientProps) {
  const hydrated = useClientHydrated();
  const { items: savedItems, cloudMode } = useStudioLibrary();
  const [remoteItem, setRemoteItem] = useState<LibraryGeneration | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);

  const localGeneration = useMemo(() => {
    if (isShowcaseGenerationId(generationId)) {
      return findLibraryGenerationById(
        getLibraryShowcaseGenerations(),
        generationId,
      );
    }
    if (cloudMode) {
      return findLibraryGenerationById(savedItems, generationId);
    }
    return findLibraryGenerationById(
      mergeSavedLibraryWithShowcase(savedItems),
      generationId,
    );
  }, [generationId, savedItems, cloudMode]);

  useEffect(() => {
    if (!cloudMode || localGeneration || !isValidUuid(generationId)) {
      setRemoteItem(null);
      setRemoteLoading(false);
      return;
    }
    let active = true;
    setRemoteLoading(true);
    void fetchRemoteLibraryGenerationById(generationId).then((item) => {
      if (active) {
        setRemoteItem(item);
        setRemoteLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [generationId, localGeneration, cloudMode]);

  const generation = localGeneration ?? remoteItem ?? undefined;

  if (!hydrated) {
    return (
      <div
        className="studio-card p-10 text-center text-sm text-studio-muted"
        aria-busy="true"
      >
        Loading recipe…
      </div>
    );
  }

  if (remoteLoading) {
    return (
      <div
        className="studio-card p-10 text-center text-sm text-studio-muted"
        aria-busy="true"
      >
        Loading recipe…
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="studio-card mx-auto max-w-lg p-10 text-center">
        <h2 className="text-lg font-medium text-studio-fg">
          Generation not found
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-studio-muted">
          This item is not in your library.
        </p>
        <Link
          href="/library"
          className="studio-btn-primary mt-6"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  const createdAtLabel = formatCreatedAt(generation.createdAt);
  const outputUsesRemoteCdn =
    generation.mediaType === "image"
      ? !generation.outputUrl.includes("images.pexels.com")
      : !generation.outputUrl.includes("videos.pexels.com");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div className="flex flex-col gap-4">
        <div
          className={`studio-media-ring relative w-full overflow-hidden rounded-xl bg-studio-bg-elevated ${aspectClassForRatio(
            generation.recipe.aspectRatio,
          )}`}
        >
          {generation.mediaType === "video" ? (
            <PreviewVideo
              src={generation.outputUrl}
              alt={generation.recipe.prompt.slice(0, 120) || "Generated video"}
            />
          ) : (
            <Image
              src={generation.outputUrl}
              alt={generation.recipe.prompt.slice(0, 120) || "Generated image"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
              unoptimized={outputUsesRemoteCdn}
            />
          )}
          <div className="absolute left-3 top-3">
            <GenerationSourceBadge
              source={generation.source}
              mediaType={generation.mediaType}
            />
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        <div className="studio-card p-5">
          <h2 className="text-sm font-medium text-studio-fg">Recipe</h2>
          <div className="mt-4">
            <GenerationRecipePanel
              generation={generation}
              createdAtLabel={createdAtLabel}
            />
          </div>
        </div>
        <Link
          href="/library"
          className="text-center text-sm text-studio-accent hover:underline"
        >
          Back to Library
        </Link>
      </aside>
    </div>
  );
}
