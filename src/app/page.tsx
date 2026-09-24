import Link from "next/link";
import { MotionReveal } from "@/components/MotionReveal";
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
    "Same compose, generate, and library loop with labeled demo clips.",
  "/library":
    "Your generations live here with recipes and remix, stored in the browser only.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="relative flex flex-col gap-8">
        <MotionReveal>
          <div className="studio-card studio-hero-media-enter overflow-hidden p-1 sm:p-1.5">
            <MediaPreview
              media={homeHeroMedia}
              aspectClass="aspect-[21/9] sm:aspect-[2.2/1]"
              priority
              className="rounded-[calc(var(--studio-radius)-4px)]"
            />
          </div>
        </MotionReveal>
        <MotionReveal className="max-w-3xl" delay={80}>
          <p className="studio-eyebrow">Creative studio</p>
          <h1 className="studio-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="studio-gradient-text">
              Create once, keep the recipe,
            </span>
            <span className="mt-1 block text-studio-fg">remix anytime.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-studio-muted">
            A focused slice of the Higgsfield map: pick an effect preset or
            start from scratch, generate images and video, and keep everything
            in your library with full recipes for remix.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/effects" className="studio-btn-primary studio-border-glow rounded-[0.625rem]">
              Browse effects
            </Link>
            <Link href="/image" className="studio-btn-secondary studio-border-glow rounded-[0.625rem]">
              Open image composer
            </Link>
          </div>
        </MotionReveal>
      </section>

      <section aria-labelledby="start-here">
        <MotionReveal>
          <h2 id="start-here" className="studio-section-label">
            Start here
          </h2>
        </MotionReveal>
        <ul className="studio-bento-grid mt-6">
          {startHere.map((item, index) => (
            <li
              key={item.href}
              className={[
                "min-h-full",
                index === 0 ? "studio-bento-feature" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <MotionReveal delay={index * 70}>
                <VisualFeatureCard
                  featured={index === 0}
                  item={{
                    ...item,
                    description: startHereCopy[item.href] ?? item.description,
                  }}
                  footer={
                    item.href === "/effects"
                      ? "Open Effects"
                      : item.href === "/image"
                        ? "Open Image"
                        : item.href === "/video"
                          ? "Open Video"
                          : "Open Library"
                  }
                />
              </MotionReveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="coming-soon-map">
        <MotionReveal>
          <h2 id="coming-soon-map" className="studio-section-label">
            On the map, not built yet
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-studio-muted">
            Same idea as the real product: each area shows the kind of output you
            would get. Links open honest Coming soon pages. Use{" "}
            <span className="text-studio-fg">More</span> in the nav.
          </p>
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
        <MotionReveal delay={100}>
          <p className="mt-6 text-sm text-studio-muted">
            Core loop today:{" "}
            <Link
              href="/effects"
              className="text-studio-accent-bright hover:underline"
            >
              Effects
            </Link>
            ,{" "}
            <Link
              href="/image"
              className="text-studio-accent-bright hover:underline"
            >
              Image
            </Link>
            ,{" "}
            <Link
              href="/video"
              className="text-studio-accent-bright hover:underline"
            >
              Video
            </Link>
            ,{" "}
            <Link
              href="/library"
              className="text-studio-accent-bright hover:underline"
            >
              Library
            </Link>
            .
          </p>
        </MotionReveal>
      </section>
    </div>
  );
}
