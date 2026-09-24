import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/audio");

export const metadata: Metadata = { title: "Audio" };

export default function AudioPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
