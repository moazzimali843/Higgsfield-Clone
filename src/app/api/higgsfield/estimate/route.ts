import { NextResponse } from "next/server";
import { fetchSoulV2Estimate } from "@/lib/higgsfield-image-job";
import { parseSoulImageJobJson } from "@/lib/higgsfield-request";

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

  const estimate = await fetchSoulV2Estimate(parsed.value, {
    HIGGSFIELD_KEY_ID: process.env.HIGGSFIELD_KEY_ID,
    HIGGSFIELD_KEY_SECRET: process.env.HIGGSFIELD_KEY_SECRET,
  });
  if (!estimate.ok) {
    return NextResponse.json({ error: estimate.error }, { status: estimate.status });
  }

  return NextResponse.json({
    credits: estimate.credits,
    usd: estimate.usd,
  });
}
