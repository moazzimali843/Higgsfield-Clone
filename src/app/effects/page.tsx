import type { Metadata } from "next";
import { PlaceholderStudioPage } from "@/components/PlaceholderStudioPage";

export const metadata: Metadata = {
  title: "Effects",
};

export default function EffectsPage() {
  return (
    <PlaceholderStudioPage
      href="/effects"
      title="Effects"
      phaseNote="Phase 3 — preset gallery"
      body="Local preset cards (name, still, prompt, settings) will live here. Choosing a preset will hand off to the image composer."
    />
  );
}
