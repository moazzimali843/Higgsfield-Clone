import { NextResponse } from "next/server";
import { submitSeedanceVideoJob } from "@/lib/higgsfield-video-job";
import { parseSoulImageJobJson } from "@/lib/higgsfield-request";

export const maxDuration = 60;

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

  const parsed = parseSoulImageJobJson(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const job = await submitSeedanceVideoJob({
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
