"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoBadge } from "@/components/DemoBadge";
import { PreviewVideo } from "@/components/PreviewVideo";
import { useStudioLibrary } from "@/hooks/use-studio-library";
import { aspectClassForRatio } from "@/lib/aspect-ratio-ui";

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
  const { items } = useStudioLibrary();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-studio-border bg-studio-panel p-8 text-center">
        <h2 className="text-lg font-medium text-studio-fg">No generations yet</h2>
        <p className="mt-2 text-sm leading-relaxed text-studio-muted">
          Run a demo job from the image or video composer. Results stay in this
          browser only — no account and no server database.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/image"
            className="inline-flex rounded-lg bg-studio-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-studio-accent/90"
          >
            Open Image composer
          </Link>
          <Link
            href="/video"
            className="inline-flex rounded-lg border border-studio-border px-4 py-2.5 text-sm font-medium text-studio-fg hover:bg-studio-panel"
          >
            Open Video composer
          </Link>
        </div>
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
              />
            )}
            <div className="absolute left-2 top-2 flex flex-wrap gap-1">
              <DemoBadge />
              {item.mediaType === "video" ? (
                <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                  Video
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
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
            <p className="mt-auto pt-2 text-xs text-studio-muted">
              Full recipe and remix arrive in Phase 5.
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
