import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/video");

export const metadata: Metadata = { title: "Video" };

export default function VideoPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
