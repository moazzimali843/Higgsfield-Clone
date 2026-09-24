import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/community");

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
