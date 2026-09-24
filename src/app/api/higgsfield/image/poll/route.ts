import { NextResponse } from "next/server";
import { pollSoulV2ImageJobOnce } from "@/lib/higgsfield-image-job";
import { parseSoulImagePollJson } from "@/lib/higgsfield-request";

export const maxDuration = 30;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = parseSoulImagePollJson(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const job = await pollSoulV2ImageJobOnce({
    ...parsed.value,
    env: {
      HIGGSFIELD_KEY_ID: process.env.HIGGSFIELD_KEY_ID,
      HIGGSFIELD_KEY_SECRET: process.env.HIGGSFIELD_KEY_SECRET,
    },
  });
  if (!job.ok) {
    return NextResponse.json({ error: job.error }, { status: job.status });
  }
  return NextResponse.json(job.result);
}
