import { NextResponse } from "next/server";
import { isValidUuid } from "@/lib/generations-db";
import { getGenerationForUser } from "@/lib/library-api-server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const item = await getGenerationForUser(supabase, user.id, id);
    if (!item) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (err) {
    console.error("[library GET id]", err);
    return NextResponse.json(
      { error: "Failed to load generation." },
      { status: 500 },
    );
  }
}
