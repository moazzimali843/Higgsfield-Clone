import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/3d");

export const metadata: Metadata = { title: "3D" };

export default function ThreeDPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
