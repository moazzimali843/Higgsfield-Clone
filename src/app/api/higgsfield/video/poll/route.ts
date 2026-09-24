import { NextResponse } from "next/server";
import { pollSeedanceVideoJobOnce } from "@/lib/higgsfield-video-job";
import { parseSeedanceVideoPollJson } from "@/lib/higgsfield-request";

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

  const parsed = parseSeedanceVideoPollJson(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const job = await pollSeedanceVideoJobOnce({
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
