import { NextResponse } from "next/server";
import { readHiggsfieldServerEnv } from "@/lib/higgsfield-client";
import { pollSoulV2ImageJobOnce } from "@/lib/higgsfield-image-job";
import { parseSoulImagePollJson } from "@/lib/higgsfield-request";
import { requireStudioUserForGeneration } from "@/lib/supabase/require-studio-user";

export const maxDuration = 30;

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

  const parsed = parseSoulImagePollJson(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const job = await pollSoulV2ImageJobOnce({
    ...parsed.value,
    env: readHiggsfieldServerEnv(),
  });
  if (!job.ok) {
    return NextResponse.json({ error: job.error }, { status: job.status });
  }
  return NextResponse.json(job.result);
}
