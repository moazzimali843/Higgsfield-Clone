import type { SupabaseClient } from "@supabase/supabase-js";
import type { LibraryGeneration } from "@/lib/generation-types";
import {
  type GenerationRow,
  type LibraryGenerationInsert,
  LIBRARY_MAX_ITEMS,
  libraryGenerationToRow,
  rowToLibraryGeneration,
} from "@/lib/generations-db";

export async function listGenerationsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<LibraryGeneration[]> {
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(LIBRARY_MAX_ITEMS);

  if (error) {
    throw error;
  }

  return (data as GenerationRow[]).map(rowToLibraryGeneration);
}

export async function getGenerationForUser(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<LibraryGeneration | null> {
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return rowToLibraryGeneration(data as GenerationRow);
}

export async function upsertGenerationForUser(
  supabase: SupabaseClient,
  userId: string,
  item: LibraryGenerationInsert,
): Promise<LibraryGeneration> {
  const row = libraryGenerationToRow(userId, item);

  const { data: existing, error: existingError } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .eq("output_url", row.output_url)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    const { data: bumped, error: bumpError } = await supabase
      .from("generations")
      .update({ created_at: new Date().toISOString() })
      .eq("id", (existing as GenerationRow).id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (bumpError) {
      throw bumpError;
    }
    return rowToLibraryGeneration(bumped as GenerationRow);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("generations")
    .insert(row)
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  await trimGenerationsToCap(supabase, userId);
  return rowToLibraryGeneration(inserted as GenerationRow);
}

async function trimGenerationsToCap(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("generations")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length <= LIBRARY_MAX_ITEMS) {
    return;
  }

  const toDelete = data.slice(LIBRARY_MAX_ITEMS).map((row) => row.id as string);
  if (toDelete.length === 0) {
    return;
  }

  await supabase
    .from("generations")
    .delete()
    .eq("user_id", userId)
    .in("id", toDelete);
}

export type ImportResult = { imported: number; skipped: number };

export async function importGenerationsForUser(
  supabase: SupabaseClient,
  userId: string,
  items: LibraryGeneration[],
): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;

  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const capped = sorted.slice(0, LIBRARY_MAX_ITEMS);
  const oldestFirst = [...capped].reverse();

  for (const item of oldestFirst) {
    try {
      await upsertGenerationForUser(supabase, userId, item);
      imported += 1;
    } catch {
      skipped += 1;
    }
  }

  return { imported, skipped };
}
