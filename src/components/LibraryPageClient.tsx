"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { GenerationSourceBadge } from "@/components/GenerationSourceBadge";
import { MotionReveal } from "@/components/MotionReveal";
import { PreviewVideo } from "@/components/PreviewVideo";
import { useClientHydrated } from "@/hooks/use-client-hydrated";
import { useMasonryColumnCount } from "@/hooks/use-masonry-column-count";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";
import type { LibraryGeneration } from "@/lib/generation-types";
import {
  libraryHrefForGeneration,
  mergeSavedLibraryWithShowcase,
} from "@/lib/studio-library";
import {
  getComposerModelById,
  getVideoComposerModelById,
} from "@/lib/studio-recipe";
import {
  distributeToShortestColumns,
  estimatedLibraryCardHeight,
} from "@/lib/library-masonry";

function modelLabelForGeneration(item: LibraryGeneration): string {
  if (item.mediaType === "video") {
    return getVideoComposerModelById(item.recipe.modelId)?.label ?? item.recipe.modelId;
  }
  return getComposerModelById(item.recipe.modelId)?.label ?? item.recipe.modelId;
}

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

function LibraryGenerationCard({
  item,
  revealDelay,
}: {
  item: LibraryGeneration;
  revealDelay: number;
}) {
  return (
    <li>
      <MotionReveal delay={revealDelay}>
        <div className="studio-card studio-card-interactive overflow-hidden">
      <div
        className={`relative w-full bg-studio-bg-elevated ${aspectClassForRatio(
          item.recipe.aspectRatio,
        )}`}
      >
        {item.mediaType === "video" ? (
          <PreviewVideo
            src={item.outputUrl}
            alt={item.recipe.prompt.slice(0, 120) || "Generated video"}
          />
        ) : (
          <Image
            src={item.outputUrl}
            alt={item.recipe.prompt.slice(0, 120) || "Generated image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={!item.outputUrl.includes("images.pexels.com")}
          />
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <GenerationSourceBadge
            source={item.source}
            mediaType={item.mediaType}
          />
          {item.mediaType === "video" ? (
            <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
              Video
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-5">
        <p className="line-clamp-3 text-sm text-studio-fg">
          {item.recipe.prompt}
        </p>
        <p className="text-xs text-studio-muted">
          {formatCreatedAt(item.createdAt)} · {item.recipe.aspectRatio} ·{" "}
          {modelLabelForGeneration(item)}
        </p>
        {item.recipe.referenceFileName ? (
          <p className="text-xs text-studio-muted">
            Reference: {item.recipe.referenceFileName}
          </p>
        ) : null}
        <div className="pt-1">
          <Link
            href={libraryHrefForGeneration(item.id)}
            className="text-sm font-medium text-studio-accent-bright hover:underline"
          >
            View recipe
          </Link>
        </div>
      </div>
        </div>
      </MotionReveal>
    </li>
  );
}

export function LibraryPageClient() {
  const hydrated = useClientHydrated();
  const {
    items: savedItems,
    loading: cloudLoading,
    error: cloudError,
    hydrated: cloudHydrated,
    cloudMode,
  } = useStudioLibrary();
  const showcaseExamples = useMemo(
    () => mergeSavedLibraryWithShowcase([]),
    [],
  );
  const items = useMemo(
    () =>
      cloudMode ? savedItems : mergeSavedLibraryWithShowcase(savedItems),
    [savedItems, cloudMode],
  );
  const columnCount = useMasonryColumnCount();
  const columns = useMemo(
    () =>
      distributeToShortestColumns(items, columnCount, (item) =>
        estimatedLibraryCardHeight(item.recipe),
      ),
    [items, columnCount],
  );

  if (!hydrated || !cloudHydrated || cloudLoading) {
    return (
      <div
        className="studio-card p-10 text-center text-sm text-studio-muted"
        aria-busy="true"
      >
        {cloudMode ? "Loading your cloud library…" : "Loading library…"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {cloudError ? (
        <p className="studio-card border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {cloudError}
        </p>
      ) : null}
    <div className="flex items-start gap-6">
      {columns.map((columnItems, columnIndex) => (
        <ul key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-6">
          {columnItems.map((item, itemIndex) => (
            <LibraryGenerationCard
              key={item.id}
              item={item}
              revealDelay={Math.min(
                columnIndex * 40 + itemIndex * 70,
                420,
              )}
            />
          ))}
        </ul>
      ))}
    </div>
    {cloudMode && showcaseExamples.length > 0 ? (
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-studio-muted">Examples</h2>
        <div className="flex items-start gap-6">
          {distributeToShortestColumns(
            showcaseExamples.slice(0, 6),
            Math.min(columnCount, 3),
            (item) => estimatedLibraryCardHeight(item.recipe),
          ).map((columnItems, columnIndex) => (
            <ul key={`ex-${columnIndex}`} className="flex min-w-0 flex-1 flex-col gap-6">
              {columnItems.map((item, itemIndex) => (
                <LibraryGenerationCard
                  key={item.id}
                  item={item}
                  revealDelay={Math.min(columnIndex * 40 + itemIndex * 70, 420)}
                />
              ))}
            </ul>
          ))}
        </div>
      </section>
    ) : null}
    </div>
  );
}
