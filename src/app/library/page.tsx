import type { Metadata } from "next";
import { PlaceholderStudioPage } from "@/components/PlaceholderStudioPage";

export const metadata: Metadata = {
  title: "Library",
};

export default function LibraryPage() {
  return (
    <PlaceholderStudioPage
      href="/library"
      title="Library"
      phaseNote="Phase 4 — browser-stored results"
      body="Your generations will appear here with recipes and remix. Data stays in the browser — no account and no server database."
    />
  );
}
