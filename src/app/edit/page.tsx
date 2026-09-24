import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/edit");

export const metadata: Metadata = { title: "Edit" };

export default function EditPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
