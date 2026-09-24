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
import { imageComposerHrefFromRecipe } from "@/lib/composer-remix-url";
import type { LibraryGeneration } from "@/lib/generation-types";
import {
  distributeToShortestColumns,
  estimatedLibraryCardHeight,
} from "@/lib/library-masonry";

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
            autoplay={false}
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
          {formatCreatedAt(item.createdAt)} · {item.mediaType} ·{" "}
          {item.recipe.aspectRatio} · {item.recipe.modelId}
        </p>
        {item.recipe.referenceFileName ? (
          <p className="text-xs text-studio-muted">
            Reference: {item.recipe.referenceFileName}
          </p>
        ) : null}
        <div className="pt-1">
          <Link
            href={imageComposerHrefFromRecipe(item.recipe)}
            className="text-sm font-medium text-studio-accent-bright hover:underline"
          >
            Remix in Image composer
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
  const { items } = useStudioLibrary();
  const columnCount = useMasonryColumnCount();
  const columns = useMemo(
    () =>
      distributeToShortestColumns(items, columnCount, (item) =>
        estimatedLibraryCardHeight(item.recipe),
      ),
    [items, columnCount],
  );

  if (!hydrated) {
    return (
      <div
        className="studio-card p-10 text-center text-sm text-studio-muted"
        aria-busy="true"
      >
        Loading your browser library…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="studio-card mx-auto max-w-lg p-10 text-center">
        <h2 className="studio-display text-lg font-semibold text-studio-fg">
          No generations yet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-studio-muted">
          Run a demo job from the image or video composer. Results stay in this
          browser only. No account and no server database.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/image" className="studio-btn-primary">
            Open Image composer
          </Link>
          <Link href="/video" className="studio-btn-secondary">
            Open Video composer
          </Link>
        </div>
      </div>
    );
  }

  return (
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
  );
}
