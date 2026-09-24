import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/marketing-studio");

export const metadata: Metadata = { title: "Marketing Studio" };

export default function MarketingStudioPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
