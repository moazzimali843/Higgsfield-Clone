import { NextResponse } from "next/server";
import {
  DEMO_JOB_DELAY_MS,
  parseDemoImageJobRequest,
  runDemoImageJob,
} from "@/lib/demo-image-job";

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

  const parsed = parseDemoImageJobRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, DEMO_JOB_DELAY_MS));

  const result = runDemoImageJob(parsed.value);
  return NextResponse.json(result);
}
