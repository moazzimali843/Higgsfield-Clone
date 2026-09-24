import type { Metadata } from "next";
import { LibraryGenerationDetailClient } from "@/components/LibraryGenerationDetailClient";

export const metadata: Metadata = {
  title: "Generation recipe",
  description: "Full recipe for a saved generation in your browser library.",
};

type LibraryGenerationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LibraryGenerationPage({
  params,
}: LibraryGenerationPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-10">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wide text-studio-accent">
          Library
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-studio-fg sm:text-4xl">
          Recipe
        </h1>
        <p className="mt-4 text-base leading-relaxed text-studio-muted">
          Prompt, model, settings, and whether the output was a labeled demo.
          Remix sends these values back to the image composer.
        </p>
      </header>

      <LibraryGenerationDetailClient generationId={id} />
    </div>
  );
}
