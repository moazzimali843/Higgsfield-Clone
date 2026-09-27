import { NextResponse } from "next/server";
import type { LibraryGeneration } from "@/lib/generation-types";
import {
  assignImportIds,
  filterImportableGenerations,
  LIBRARY_MAX_ITEMS,
} from "@/lib/generations-db";
import { importGenerationsForUser } from "@/lib/library-api-server";
import { parseLibraryJson } from "@/lib/studio-library";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const rawItems = record.items;
  let items: LibraryGeneration[] = [];

  if (Array.isArray(rawItems)) {
    items = parseLibraryJson(JSON.stringify(rawItems));
  }

  items = assignImportIds(filterImportableGenerations(items));
  if (items.length > LIBRARY_MAX_ITEMS) {
    items = items
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, LIBRARY_MAX_ITEMS);
  }

  try {
    const result = await importGenerationsForUser(supabase, user.id, items);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[library import]", err);
    return NextResponse.json(
      { error: "Failed to import library." },
      { status: 500 },
    );
  }
}
