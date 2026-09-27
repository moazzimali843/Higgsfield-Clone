"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MotionReveal } from "@/components/MotionReveal";
import { VisualFeatureCard } from "@/components/VisualFeatureCard";
import {
  filterHomeGalleryItems,
  type HomeGalleryCategory,
  type HomeGalleryItem,
} from "@/lib/home-gallery-filter";
import { comingSoonNav, liveNav, type NavItem } from "@/lib/navigation";
import { getPreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";

const CATEGORY_PILLS: { id: HomeGalleryCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
  { id: "library", label: "Library" },
];

const workflowRoutes = ["/image", "/video", "/library"] as const;

const workflowCopy: Record<(typeof workflowRoutes)[number], string> = {
  "/image": "Create stills from a prompt.",
  "/video": "Create short clips from a prompt.",
  "/library": "Browse what you have saved.",
};

function HomeWorkflowCard({ item }: { item: NavItem }) {
  const media = getPreviewMedia(item.href);
  return (
    <Link
      href={item.href}
      className="studio-card studio-card-interactive group/card flex h-full flex-col overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
    >
      {media ? (
        <MediaPreview
          media={media}
          aspectClass="aspect-[4/5]"
          showCredit={false}
          className="rounded-none"
        />
      ) : (
        <div className="aspect-[4/5] bg-zinc-100" />
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="studio-display text-lg font-semibold text-studio-fg">
          {item.label}
        </h3>
        <p className="mt-1 text-sm text-studio-muted">
          {workflowCopy[item.href as (typeof workflowRoutes)[number]] ??
            item.description}
        </p>
        <span className="mt-3 text-sm font-medium text-studio-fg">Open</span>
      </div>
    </Link>
  );
}

export function HomePageClient() {
  const [category, setCategory] = useState<HomeGalleryCategory>("all");

  const galleryItems = useMemo((): HomeGalleryItem[] => {
    return workflowRoutes.map((href) => ({
      kind: "route",
      href,
      id: `route-${href}`,
    }));
  }, []);

  const filtered = useMemo(
    () => filterHomeGalleryItems(galleryItems, category),
    [galleryItems, category],
  );

  const navByHref = useMemo(
    () => new Map(liveNav.map((item) => [item.href, item])),
    [],
  );

  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="templates-heading">
        <MotionReveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="templates-heading"
                className="studio-display text-xl font-semibold text-studio-fg sm:text-2xl"
              >
                Workflows
              </h2>
              <p className="mt-1 text-sm text-studio-muted">
                Open Image, Video, or Library.
              </p>
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter workflows"
            >
              {CATEGORY_PILLS.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  className="studio-btn-pill"
                  aria-pressed={category === pill.id}
                  onClick={() => setCategory(pill.id)}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </MotionReveal>

        {filtered.length === 0 ? (
          <p className="mt-8 text-center text-sm text-studio-muted">
            Nothing in this filter yet. Try All.
          </p>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item, index) => (
              <li key={item.id} className="min-h-full">
                <MotionReveal delay={Math.min(index * 40, 320)}>
                  <HomeWorkflowCard item={navByHref.get(item.href)!} />
                </MotionReveal>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="coming-soon-map">
        <MotionReveal>
          <h2 id="coming-soon-map" className="studio-section-label">
            Coming soon
          </h2>
        </MotionReveal>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonNav.map((item, index) => (
            <li key={item.href} className="min-h-full">
              <MotionReveal delay={index * 50}>
                <VisualFeatureCard
                  item={item}
                  badge="Soon"
                  footer="Learn more"
                />
              </MotionReveal>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
