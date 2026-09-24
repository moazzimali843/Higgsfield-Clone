import Link from "next/link";
import type { NavItem } from "@/lib/navigation";
import { getPreviewMedia } from "@/lib/preview-media";
import { StudioPageHero } from "@/components/StudioPageHero";

type ComingSoonPageProps = {
  item: NavItem;
};

export function ComingSoonPage({ item }: ComingSoonPageProps) {
  const media = getPreviewMedia(item.href);

  return (
    <div className="mx-auto max-w-3xl">
      {media ? (
        <StudioPageHero media={media} eyebrow="Coming soon" title={item.label}>
          {item.description ? (
            <p className="mt-4 text-base leading-relaxed text-studio-muted">
              {item.description}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-studio-muted">
            This route stays on the map so navigation stays honest. Core work
            lives in Effects, Image, and Library.
          </p>
        </StudioPageHero>
      ) : (
        <>
          <p className="text-sm font-medium uppercase tracking-wide text-studio-accent">
            Coming soon
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-studio-fg">
            {item.label}
          </h1>
        </>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/effects"
          className="rounded-lg bg-studio-accent px-4 py-2 text-sm font-medium text-white hover:bg-studio-accent/90"
        >
          Browse Effects
        </Link>
        <Link
          href="/image"
          className="rounded-lg border border-studio-border px-4 py-2 text-sm font-medium text-studio-fg hover:bg-zinc-100"
        >
          Open Image composer
        </Link>
        <Link
          href="/"
          className="rounded-lg px-4 py-2 text-sm text-studio-muted hover:text-studio-fg"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
