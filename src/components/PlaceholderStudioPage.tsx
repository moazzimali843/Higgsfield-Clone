import Link from "next/link";
import { getPreviewMedia } from "@/lib/preview-media";
import { StudioPageHero } from "@/components/StudioPageHero";

type PlaceholderStudioPageProps = {
  title: string;
  phaseNote: string;
  body: string;
  href: string;
};

export function PlaceholderStudioPage({
  title,
  phaseNote,
  body,
  href,
}: PlaceholderStudioPageProps) {
  const media = getPreviewMedia(href);

  return (
    <div className="mx-auto max-w-3xl">
      {media ? (
        <StudioPageHero media={media} eyebrow={phaseNote} title={title}>
          <p className="mt-4 text-base leading-relaxed text-studio-muted">
            {body}
          </p>
        </StudioPageHero>
      ) : (
        <>
          <p className="text-sm font-medium text-studio-accent">{phaseNote}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-studio-fg">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-studio-muted">
            {body}
          </p>
        </>
      )}
      <Link
        href="/"
        className="mt-8 inline-block text-sm text-studio-accent hover:underline"
      >
        ← Home
      </Link>
    </div>
  );
}
