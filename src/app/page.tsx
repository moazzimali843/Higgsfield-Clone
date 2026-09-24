import Link from "next/link";
import { VisualFeatureCard } from "@/components/VisualFeatureCard";
import { MediaPreview } from "@/components/MediaPreview";
import { comingSoonNav, liveNav } from "@/lib/navigation";
import { homeHeroMedia } from "@/lib/preview-media";

const startHere = liveNav.filter((item) => item.href !== "/");

const startHereCopy: Record<string, string> = {
  "/effects":
    "Browse preset looks and open one in the image composer with prompt and settings pre-filled.",
  "/image":
    "Write a prompt, choose settings, and generate labeled demo images.",
  "/video":
    "Same compose → generate loop with labeled demo clips for your library.",
  "/library":
    "Your generations will live here with recipes and remix — stored in the browser only.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <MediaPreview
          media={homeHeroMedia}
          aspectClass="aspect-[21/9] sm:aspect-[2.2/1]"
          priority
          className="ring-1 ring-studio-border"
        />
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-studio-fg sm:text-5xl">
            Create once, keep the recipe, remix anytime.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-studio-muted">
            A focused slice of the Higgsfield map: pick an effect preset or
            start from scratch, generate images and video, and keep
            everything in your library with full recipes for remix.
          </p>
        </div>
      </section>

      <section aria-labelledby="start-here">
        <h2
          id="start-here"
          className="text-sm font-medium uppercase tracking-wide text-studio-muted"
        >
          Start here
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {startHere.map((item) => (
            <li key={item.href} className="min-h-full">
              <VisualFeatureCard
                item={{
                  ...item,
                  description: startHereCopy[item.href] ?? item.description,
                }}
                footer={
                  item.href === "/effects"
                    ? "Open Effects →"
                    : item.href === "/image"
                      ? "Open Image →"
                      : item.href === "/video"
                        ? "Open Video →"
                        : "Open Library →"
                }
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="coming-soon-map">
        <h2
          id="coming-soon-map"
          className="text-sm font-medium uppercase tracking-wide text-studio-muted"
        >
          On the map, not built yet
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-studio-muted">
          Same idea as the real product: each area shows the kind of output you
          would get. Links open honest Coming soon pages — use{" "}
          <span className="text-studio-fg">More</span> in the nav.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonNav.map((item) => (
            <li key={item.href} className="min-h-full">
              <VisualFeatureCard item={item} badge="Soon" footer="Learn more →" />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-studio-muted">
          Core loop today:{" "}
          <Link href="/effects" className="text-studio-accent hover:underline">
            Effects
          </Link>
          ,{" "}
          <Link href="/image" className="text-studio-accent hover:underline">
            Image
          </Link>
          ,{" "}
          <Link href="/video" className="text-studio-accent hover:underline">
            Video
          </Link>
          ,{" "}
          <Link href="/library" className="text-studio-accent hover:underline">
            Library
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
