import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/supercomputer");

export const metadata: Metadata = { title: "Supercomputer" };

export default function SupercomputerPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
