import { NextResponse } from "next/server";
import { readHiggsfieldServerEnv } from "@/lib/higgsfield-client";
import { submitSeedanceVideoJob } from "@/lib/higgsfield-video-job";
import { parseSoulImageJobJson } from "@/lib/higgsfield-request";
import { requireStudioUserForGeneration } from "@/lib/supabase/require-studio-user";

export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireStudioUserForGeneration();
  if (!auth.ok) {
    return auth.response;
  }

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
    env: readHiggsfieldServerEnv(),
  });
  if (!job.ok) {
    return NextResponse.json({ error: job.error }, { status: job.status });
  }
  return NextResponse.json(job.result);
}
