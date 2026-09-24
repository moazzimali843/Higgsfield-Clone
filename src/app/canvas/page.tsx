import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/canvas");

export const metadata: Metadata = { title: "Canvas" };

export default function CanvasPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
