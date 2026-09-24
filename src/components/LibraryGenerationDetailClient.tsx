"use client";

import Link from "next/link";
import Image from "next/image";
import { GenerationSourceBadge } from "@/components/GenerationSourceBadge";
import { GenerationRecipePanel } from "@/components/GenerationRecipePanel";
import { PreviewVideo } from "@/components/PreviewVideo";
import { useClientHydrated } from "@/hooks/use-client-hydrated";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";
import {
  composerHrefForRemix,
  findLibraryGenerationById,
} from "@/lib/composer-remix";

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
  const { items } = useStudioLibrary();
  const generation = hydrated
    ? findLibraryGenerationById(items, generationId)
    : undefined;

  if (!hydrated) {
    return (
      <div
        className="studio-card p-10 text-center text-sm text-studio-muted"
        aria-busy="true"
      >
        Loading recipe from this browser…
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
          This id is not in your browser library. It may have been cleared, or
          you opened a link from another device.
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
              autoplay={false}
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
          href={composerHrefForRemix(generation.id)}
          className="studio-btn-primary justify-center"
        >
          Remix in Image composer
        </Link>
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
