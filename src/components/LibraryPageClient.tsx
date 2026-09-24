"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoBadge } from "@/components/DemoBadge";
import { useClientHydrated } from "@/hooks/use-client-hydrated";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";
import {
  composerHrefForRemix,
  libraryHrefForGeneration,
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

export function LibraryPageClient() {
  const hydrated = useClientHydrated();
  const { items } = useStudioLibrary();

  if (!hydrated) {
    return (
      <div
        className="rounded-xl border border-studio-border bg-studio-panel p-8 text-center text-sm text-studio-muted"
        aria-busy="true"
      >
        Loading your browser library…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-studio-border bg-studio-panel p-8 text-center">
        <h2 className="text-lg font-medium text-studio-fg">No generations yet</h2>
        <p className="mt-2 text-sm leading-relaxed text-studio-muted">
          Run a demo job from the image composer. Results stay in this browser
          only — no account and no server database.
        </p>
        <Link
          href="/image"
          className="mt-6 inline-flex rounded-lg bg-studio-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-studio-accent/90"
        >
          Open Image composer
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col overflow-hidden rounded-xl border border-studio-border bg-studio-panel"
        >
          <div
            className={`relative w-full bg-studio-bg ${aspectClassForRatio(
              item.recipe.aspectRatio,
            )}`}
          >
            <Image
              src={item.outputUrl}
              alt={item.recipe.prompt.slice(0, 120) || "Generated image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute left-2 top-2">
              <DemoBadge />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <p className="line-clamp-3 text-sm text-studio-fg">
              {item.recipe.prompt}
            </p>
            <p className="text-xs text-studio-muted">
              {formatCreatedAt(item.createdAt)} · {item.recipe.aspectRatio} ·{" "}
              {item.recipe.modelId}
            </p>
            {item.recipe.referenceFileName ? (
              <p className="text-xs text-studio-muted">
                Reference: {item.recipe.referenceFileName}
              </p>
            ) : null}
            <div className="mt-auto flex flex-wrap gap-2 pt-3">
              <Link
                href={libraryHrefForGeneration(item.id)}
                className="rounded-lg border border-studio-border px-3 py-1.5 text-xs font-medium text-studio-fg hover:border-studio-accent/40"
              >
                View recipe
              </Link>
              <Link
                href={composerHrefForRemix(item.id)}
                className="rounded-lg bg-studio-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-studio-accent/90"
              >
                Remix
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
