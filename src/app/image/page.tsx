import type { Metadata } from "next";
import { PlaceholderStudioPage } from "@/components/PlaceholderStudioPage";

export const metadata: Metadata = {
  title: "Image",
};

export default function ImagePage() {
  return (
    <PlaceholderStudioPage
      href="/image"
      title="Image composer"
      phaseNote="Phase 4 — compose and generate"
      body="Prompt, aspect ratio, model list, and optional reference image will live here, with a demo job loop and labeled results."
    />
  );
}
