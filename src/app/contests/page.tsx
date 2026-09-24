import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/contests");

export const metadata: Metadata = { title: "Contests" };

export default function ContestsPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
