import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getComingSoonItem } from "@/lib/get-coming-soon-item";

const item = getComingSoonItem("/mcp");

export const metadata: Metadata = { title: "MCP" };

export default function McpPage() {
  if (!item) notFound();
  return <ComingSoonPage item={item} />;
}
