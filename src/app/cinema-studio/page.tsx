import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/cinema-studio");

export const metadata: Metadata = { title: "Cinema Studio" };

export default function CinemaStudioPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
