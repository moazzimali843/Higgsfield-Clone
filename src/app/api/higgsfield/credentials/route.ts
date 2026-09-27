import { NextResponse } from "next/server";
import {
  deleteHiggsfieldCredentialsForUser,
  getHiggsfieldCredentialsForUser,
  parseHiggsfieldCredentialsBody,
  saveHiggsfieldCredentialsForUser,
} from "@/lib/higgsfield-credentials-db";
import { formatHiggsfieldCredentialsString } from "@/lib/higgsfield-client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAuthedSupabase() {
  if (!isSupabaseConfigured()) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      ),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  return { ok: true as const, supabase, userId: user.id };
}

export async function GET() {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const creds = await getHiggsfieldCredentialsForUser(
      auth.supabase,
      auth.userId,
    );
    return NextResponse.json({
      credentials: creds ? formatHiggsfieldCredentialsString(creds) : null,
    });
  } catch (err) {
    console.error("[higgsfield credentials GET]", err);
    return NextResponse.json(
      { error: "Failed to load API key." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseHiggsfieldCredentialsBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await saveHiggsfieldCredentialsForUser(
      auth.supabase,
      auth.userId,
      parsed.value,
    );
    return NextResponse.json({
      credentials: formatHiggsfieldCredentialsString(parsed.value),
    });
  } catch (err) {
    console.error("[higgsfield credentials PUT]", err);
    return NextResponse.json(
      { error: "Failed to save API key." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await deleteHiggsfieldCredentialsForUser(auth.supabase, auth.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[higgsfield credentials DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete API key." },
      { status: 500 },
    );
  }
}
